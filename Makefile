.PHONY: dev build preview check

dev:
	npm run dev

build:
	npm run build

preview:
	npm run preview

check:
	python3 scripts/check_site.py
