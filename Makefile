.PHONY: dev build preview check

dev:
	bun run dev

build:
	bun run build

preview:
	bun run preview

check:
	python3 scripts/check_site.py
