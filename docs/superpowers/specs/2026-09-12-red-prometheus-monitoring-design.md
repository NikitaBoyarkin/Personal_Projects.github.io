# RED-мониторинг портфолио на Prometheus — Design Spec

- **Дата:** 2026-09-12
- **Статус:** дизайн одобрен, ожидает план реализации
- **Проект:** `Personal_Projects.github.io` (Astro static, GitHub Pages)
- **Метод:** RED (Rate, Errors, Duration) → Prometheus exposition format, real-time
- **Источник методологии:** Splunk RED monitoring; метрики — Google Core Web Vitals

---

## 1. Цель и контекст

Поднять локальный Prometheus-стек, который экспортирует RED-метрики портфолио в
текстовом exposition-формате в реальном времени.

**Ограничения:**
- Статичный Astro-сайт на GitHub Pages — нет серверного runtime на самом сайте.
- PostHog уже собирает `$pageview` и `$web_vitals` (posthog-js на клиенте).
- Стек бежит локально; beacon-приёмник доступен публично через cloudflare named
  tunnel (стабильный hostname).
- Гибридная схема: beacon-push для Rate/Errors (real-time), PostHog-pull для
  Duration (web-vitals уже собираются).

## 2. Архитектура

Один сервис `red-exporter` с двумя путями приёма данных и одной точкой `/metrics`:

```
site (Pages) ──sendBeacon──▶ red-exporter :9100/beacon ──▶ counters (real-time)
                                  │
                                  │ фоновый poller (каждые 15с)
                                  ▼
                               PostHog (web-vitals p75 per path) ──▶ gauges (Duration)

   red-exporter :9100/metrics (в docker-сети, не published на хост) ──▶ Prometheus scrape 15s
   Grafana ──query──▶ Prometheus
   cloudflared named tunnel: metrics.домен ──▶ red-exporter:9100/beacon
```

**Почему один экспортёр, а не два (collector + bridge):** data-flow тот же, но
меньше движущихся частей — один контейнер, один scrape-target, один `/metrics`.
Beacon-эндпоинт и PostHog-poller — разные ingest-пути в одном процессе.

**Security-граница:** один uvicorn-процесс / один порт 9100 (один
`prometheus_client` registry — иначе beacon-инкременты в процессе A не видны в
`/metrics` процесса B). Порт 9100 не published на хост; публично доступен только
через cloudflared, чей ingress фильтрует пути: `/beacon` и `/healthz` → exporter,
остальное → 404. `/metrics` достижим только внутри docker-сети (Prometheus
скрейпит `red-exporter:9100/metrics`). Публичный интернет видит только `/beacon` и `/healthz`.

## 3. Компоненты

### 3.1 red-exporter (Python, FastAPI + prometheus_client)
- `POST /beacon` — приём `navigator.sendBeacon`, парсинг JSON, инкремент счётчиков.
- Фоновый поток PostHog-poller (каждые `POSTHOG_PULL_INTERVAL` сек, по умолчанию 15).
- `GET /metrics` (порт 9100, приватно в docker-сети) — exposition-формат через `prometheus_client`.
- `GET /healthz` — liveness.
- CORS для origin сайта на `/beacon`.
- In-memory метрики (счётчики/гауги в процессе); рестарт = reset счётчиков —
  Prometheus корректно обрабатывает через `resets()`.

### 3.2 Beacon-сниппет (Astro-компонента)
`src/components/BeaconMetrics.astro`, подключается в Layout.
- `navigator.sendBeacon` на события:
  - `pageview` — на `load` (path, locale, session_id).
  - `error` — на `window.onerror` и `unhandledrejection` (message, type, path).
- endpoint из `import.meta.env.PUBLIC_BEACON_ENDPOINT` (Astro public env, build-time).
- session_id — `sessionStorage` UUID (генерируется на визит).
- fail-silent: всё в `try/catch`, beacon-ошибки никогда не ломают сайт, не блокируют рендер.
- уважает `navigator.doNotTrack` (опц., по умолчанию шлёт).

### 3.3 Prometheus
`prometheus/prometheus.yml`: scrape `red-exporter:9101` каждые 15с, TSDB volume.

### 3.4 Grafana (опц.)
`grafana/grafana`, provisioned datasource (Prometheus) + RED-дашборд (3 панели:
Rate, Errors, Duration). Provisioning через файлы, без ручной настройки.

### 3.5 cloudflared
Named tunnel: `metrics.домен → red-exporter:9100`. Настраивается один раз
(`cloudflared tunnel create` + DNS CNAME). После — `cloudflared tunnel run` в compose.

## 4. Каталог метрик (Prometheus exposition)

| Ось | Метрика | Тип | Labels | Источник |
|---|---|---|---|---|
| Rate | `portfolio_pageviews_total` | Counter | `path`, `locale` | beacon |
| Rate | `portfolio_active_sessions` | Gauge | — | beacon (session_id set) |
| Rate | `portfolio_sessions_total` | Counter | — | beacon |
| Errors | `portfolio_js_errors_total` | Counter | `path`, `type` | beacon (window.onerror) |
| Errors | `portfolio_beacon_failures_total` | Counter | `reason` | exporter (parse/cors) |
| Duration | `portfolio_lcp_seconds` | Gauge | `path` | PostHog pull (p75) |
| Duration | `portfolio_inp_seconds` | Gauge | `path` | PostHog pull (p75) |
| Duration | `portfolio_cls` | Gauge | `path` | PostHog pull (p75) |
| Duration | `portfolio_fcp_seconds` | Gauge | `path` | PostHog pull (p75) |
| Rate (кросс-чек) | `portfolio_posthog_pageviews_30d` | Gauge | — | PostHog pull |
| Self | `portfolio_posthog_pull_errors_total` | Counter | — | exporter |
| Self | `portfolio_posthog_pull_duration_seconds` | Gauge | — | exporter |
| Self | `portfolio_exporter_up` | Gauge | — | exporter |
| Self | `promhttp_*`, `process_*` | — | — | prometheus_client |

**Производные (PromQL, не метрики):**
- Error rate: `rate(portfolio_js_errors_total[5m]) / rate(portfolio_pageviews_total[5m])`.
- RPS: `rate(portfolio_pageviews_total[1m])`.

## 5. Контракт beacon

`POST /beacon`, body — JSON (один event или массив events):
```json
{
  "type": "pageview",
  "path": "/projects/cohort/",
  "locale": "ru",
  "ts": 1694520000000,
  "session_id": "550e8400-..."
}
```
```json
{
  "type": "error",
  "path": "/projects/cohort/",
  "locale": "ru",
  "ts": 1694520000000,
  "session_id": "550e8400-...",
  "error": { "message": "Cannot read props of null", "type": "TypeError" }
}
```
- `Content-Type: text/plain;charset=UTF-8` (sendBeacon default) — exporter парсит JSON из тела.
- CORS: `Access-Control-Allow-Origin: <SITE_ORIGIN>` (или `*` для dev). `OPTIONS` preflight не нужен для sendBeacon (simple request), но exporter отвечает на OPTIONS на всякий случай.
- Размер: sendBeacon ограничен 64KB — достаточно для одного event; батч при pagehide.

## 6. Контракт PostHog-pull

Poller вызывает PostHog Query API:
- `POST https://us.posthog.com/api/projects/451732/query` с HogQL/Insights-запросом
  для LCP/INP/CLS/FCP p75 per path за скользящее окно `POSTHOG_PULL_WINDOW` (по умолчанию 30m).
- Auth: `Bearer <POSTHOG_API_KEY>` — **нужен personal API key** PostHog (создаётся в
  PostHog → profile → API keys), НЕ публичный project token из posthog-js.
  Это обязательный prerequisite (см. §13).
- На успех: обновляет gauges per path.
- На ошибку (4xx/5xx/timeout): `portfolio_posthog_pull_errors_total++`, лог, keeps
  last-known values, retry на следующем тике.
- На пустой результат (нет web-vitals за окно): gauges не обновляются (keep last),
  лог "no samples".

**Ограничение:** на низком трафике (24 visitor/30d) p75 за 30m окно будет нестабильным
/ часто пустым. Это известный лимит — Duration-метрики будут "рваными". Решение в
будущем — увеличить окно или переключить на beacon web-vitals (out of scope).

## 7. Layout (в репо портфолио — `monitoring/`)

```
Personal_Projects.github.io/monitoring/
  docker-compose.yml            # prometheus + red-exporter + grafana + cloudflared
  prometheus/prometheus.yml
  exporter/
    red_exporter.py             # /beacon + PostHog poller + /metrics
    pyproject.toml
    Dockerfile
    tests/
      test_beacon.py
      test_posthog_pull.py
      test_metrics.py
  grafana/provisioning/
    datasources/prometheus.yml
    dashboards/red-dashboard.json
  .env.example
  README.md
  Makefile                      # monitor-up / monitor-down / monitor-logs
src/components/BeaconMetrics.astro   # подключается в BaseLayout
```

Astro игнорирует `monitoring/` при сборке (не в `src/`/`public/`) → на деплой
Pages не влияет. `BeaconMetrics.astro` добавляет один `<script>` в Layout.

## 8. Конфигурация

`monitoring/.env.example`:
```
# PostHog pull (Duration)
POSTHOG_API_KEY=<personal API key, query API — создать в PostHog profile>
POSTHOG_PROJECT_ID=451732
POSTHOG_HOST=https://us.posthog.com
POSTHOG_PULL_INTERVAL=15
POSTHOG_PULL_WINDOW=30m

# Beacon public endpoint (build-time, вшит в сайт)
PUBLIC_BEACON_ENDPOINT=https://metrics.домен/beacon
SITE_ORIGIN=https://nikitaboyarkin.github.io
```

`PUBLIC_BEACON_ENDPOINT` также добавляется в корневой `.env` портфолио (Astro
читает `PUBLIC_*` как build-time env). Named tunnel → URL стабильный, перестроение
сайта нужно один раз.

## 9. Операция

- `make monitor-up` → `docker compose up -d` (prometheus, red-exporter, grafana, cloudflared).
- `make monitor-down` → `docker compose down`.
- `make monitor-logs` → `docker compose logs -f red-exporter`.
- URL-ы: Prometheus `http://localhost:9090`, Grafana `http://localhost:3000`.
  exporter `/metrics` приватно в docker-сети: `make monitor-metrics` →
  `docker compose exec red-exporter curl -s localhost:9100/metrics`.
- Named tunnel setup (one-time):
  1. `cloudflared tunnel login` (браузер, CF-аккаунт).
  2. `cloudflared tunnel create red-portfolio`.
  3. `cloudflared tunnel route dns red-portfolio metrics.домен`.
  4. `monitoring/cloudflared/config.yml` → ingress `metrics.домен → http://red-exporter:9100`.

## 10. Обработка ошибок

| Случай | Поведение |
|---|---|
| beacon JSON невалиден | 400, `portfolio_beacon_failures_total{reason="parse"}++`, без крэша |
| CORS origin не совпал | 403, `portfolio_beacon_failures_total{reason="cors"}++` |
| PostHog pull 4xx/5xx/timeout | `portfolio_posthog_pull_errors_total++`, keep last values, retry next tick |
| PostHog пустой результат | gauges не трогать, лог "no samples" |
| exporter crash | `restart: unless-stopped` в compose |
| counter reset после рестарта | Prometheus обрабатывает через `resets()`/rate |

## 11. Тестирование

**pytest (`exporter/tests/`):**
- `test_beacon.py` — парсинг pageview/error payload, инкремент счётчиков, невалидный JSON → 400 + failure counter.
- `test_posthog_pull.py` — мок ответа PostHog, парсинг p75 per path, обновление gauges, ошибка → error counter + keep last.
- `test_metrics.py` — `GET /metrics` возвращает exposition-строки с ожидаемыми именами метрик и labels (`# HELP`, `# TYPE`, `portfolio_pageviews_total{...}`).

**Интеграционный smoke:**
- `docker compose up`, `curl red-exporter:9101/metrics` → 200, есть `portfolio_`.
- Post beacon → счётчик вырос в `/metrics`.
- Prometheus query `portfolio_pageviews_total` → возвращает значение.

**Beacon-сниппет:** если логику payload вынести в функцию (`src/lib/beacon.ts`),
покрыть unit-тестом (vitest, уже настроен в портфолио).

## 12. Out of scope

- Production-хостинг (Fly.io/Render) — только local + tunnel.
- Alerting (Alertmanager, правила) — future.
- Long-term storage (Thanos/Cortex) — future.
- Auth на `/beacon` (rate limit / shared secret) — future, сейчас только CORS origin check.
- Beacon web-vitals (отправка LCP/CLS/INP с клиента вместо PostHog pull) — future,
  если real-time Duration станет критичен.

## 13. Prerequisites

- Docker + docker compose v2.
- Cloudflare-аккаунт + домен на CF (для named tunnel стабильного hostname).
- **PostHog personal API key** (query API) — создать в PostHog → profile → API keys.
  Публичный project token (из posthog-js) для pull НЕ подходит.
- Node 22 (для пересборки сайта при смене `PUBLIC_BEACON_ENDPOINT` — с named tunnel
  один раз).

## 14. Открытые вопросы (на этап плана/имплементации)

- Точный HogQL-запрос для web-vitals p75 per path за 30m окно (прототипировать в
  PostHog SQL editor перед кодированием).
- Структура RED-дашборда Grafana (panels/queries) — взять из стандартного RED
  dashboard или собрать с нуля.
