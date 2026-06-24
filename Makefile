.PHONY: serve check

serve:
	python3 -m http.server 8000

check:
	python3 scripts/check_site.py
