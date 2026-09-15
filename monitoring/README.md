# RED-мониторинг портфолио (Prometheus)

Локальный стек: red-exporter (Bun) + Prometheus + Grafana + cloudflared tunnel.
Метрики RED (Rate, Errors, Duration) в exposition-формате, real-time.

## Prerequisites
- Docker + docker compose v2
- Cloudflare-аккаунт + домен на CF (для named tunnel)
- PostHog **personal API key** (Profile → API keys) — НЕ публичный project token

## One-time setup
1. `cp .env.example .env`; заполнить `POSTHOG_API_KEY`, `PUBLIC_BEACON_ENDPOINT`.
2. Named tunnel:
   `cloudflared tunnel login`
   `cloudflared tunnel create red-portfolio`
   `cloudflared tunnel route dns red-portfolio metrics.ваш-домен`
   Вписать `CLOUDFLARE_TUNNEL_TOKEN` (или `CLOUDFLARE_TUNNEL_ID` + credentials) в `.env`.
3. В корне портфолио `.env` добавить `PUBLIC_BEACON_ENDPOINT=https://metrics.ваш-домен/beacon`; `bun run build`.

## Запуск
`make monitor-up` → Prometheus :9090, Grafana :3000.
`make monitor-metrics` → exposition-строки.
`make monitor-down` → стоп.

## Exporter (Bun, без runtime-зависимостей)
`monitoring/exporter/` — Bun.serve + bun:sqlite, `Dockerfile` на `oven/bun:1.4-alpine`.
Тот же контракт, что и у старого FastAPI-экспортёра: `/healthz`, `POST /beacon`,
`GET /metrics` (Prometheus text format), метрики `portfolio_*` — дашборды Grafana не трогаются.

```bash
cd monitoring/exporter
bun install            # только @types/bun (dev)
bun test               # 24 теста
bun run check          # tsc --noEmit
BEACON_DB=/tmp/beacon.sqlite bun run src/index.ts   # локальный запуск
```

- `BEACON_DB` (путь к SQLite) — опционально: если задан, сырые beacon-события
  пишутся в `beacon_events` (id, ts, type, path, locale, session_id, payload).
  В compose включён через named volume `beacon-data:/data`. Без `BEACON_DB`
  поведение идентично старому: только in-memory счётчики.
- `START_POLLER=1` (в Docker) запускает фоновый pull Web-Vitals p75 из PostHog.

## Security
Порт 9100 не published на хост. Публично через tunnel доступны только /beacon и
/healthz (cloudflared ingress path-filter). /metrics — только в docker-сети.
