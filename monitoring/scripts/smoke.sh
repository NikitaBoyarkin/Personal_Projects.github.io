#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
echo "== up =="
make monitor-up
sleep 5
echo "== beacon =="
docker compose exec -T red-exporter sh -c 'curl -s -X POST localhost:9100/beacon -d "{\"type\":\"pageview\",\"path\":\"/smoke\",\"locale\":\"ru\",\"session_id\":\"s1\"}"'
echo
echo "== exporter metric =="
make monitor-metrics | grep -E "portfolio_pageviews_total|portfolio_lcp_seconds"
echo "== prometheus query =="
docker compose exec -T prometheus wget -qO- 'http://localhost:9090/api/v1/query?query=portfolio_pageviews_total' | python3 -m json.tool | head -20
echo "== done =="