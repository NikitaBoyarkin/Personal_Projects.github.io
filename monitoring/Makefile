.PHONY: monitor-up monitor-down monitor-logs monitor-metrics monitor-ps

monitor-up:
	docker compose up -d

monitor-down:
	docker compose down

monitor-logs:
	docker compose logs -f red-exporter

monitor-metrics:
	docker compose exec -T red-exporter sh -c "curl -s localhost:9100/metrics | head -40"

monitor-ps:
	docker compose ps
