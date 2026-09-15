import { Database } from "bun:sqlite";

export interface BeaconStore {
  append(event: Record<string, unknown>): void;
  close(): void;
}

export function openBeaconStore(path: string): BeaconStore {
  const db = new Database(path, { create: true });
  db.run(`
    CREATE TABLE IF NOT EXISTS beacon_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts INTEGER NOT NULL,
      type TEXT,
      path TEXT,
      locale TEXT,
      session_id TEXT,
      payload TEXT NOT NULL
    )
  `);
  const insert = db.prepare(`
    INSERT INTO beacon_events (ts, type, path, locale, session_id, payload)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  return {
    append(event) {
      insert.run(
        Date.now(),
        typeof event.type === "string" ? event.type : null,
        typeof event.path === "string" ? event.path : null,
        typeof event.locale === "string" ? event.locale : null,
        typeof event.session_id === "string" ? event.session_id : null,
        JSON.stringify(event),
      );
    },
    close() {
      db.close();
    },
  };
}