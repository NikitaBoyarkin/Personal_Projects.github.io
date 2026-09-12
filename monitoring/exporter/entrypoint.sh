#!/bin/sh
set -e
exec uvicorn red_exporter.app:app --host 0.0.0.0 --port 9100