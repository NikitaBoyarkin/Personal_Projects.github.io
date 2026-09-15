FROM oven/bun:1.4-alpine

WORKDIR /app

COPY src ./src

ENV START_POLLER=1

EXPOSE 9100

CMD ["bun", "src/index.ts"]