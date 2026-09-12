FROM python:3.12-slim

WORKDIR /app

RUN pip install --no-cache-dir uvicorn[standard] fastapi prometheus-client requests

COPY red_exporter ./red_exporter

ENV START_POLLER=1

EXPOSE 9100

CMD ["uvicorn", "red_exporter.app:app", "--host", "0.0.0.0", "--port", "9100"]