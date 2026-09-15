# RED-мониторинг портфолио (Prometheus)

Локальный стек: red-exporter (FastAPI) + Prometheus + Grafana + cloudflared tunnel.
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

## Security
Порт 9100 не published на хост. Публично через tunnel доступны только /beacon и
/healthz (cloudflared ingress path-filter). /metrics — только в docker-сети.
