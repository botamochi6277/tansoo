import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import type { ClothItem, NewClothItem } from './types';

const STORAGE_KEY = 'smart-closet-db';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  purchased_date TEXT NOT NULL,
  brand TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT NOT NULL,
  cost INTEGER NOT NULL,
  image TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT ''
);`;

function toBase64(bytes: Uint8Array): string {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s);
}

function fromBase64(s: string): Uint8Array {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
}

let SQL: SqlJsStatic;
let db: Database;

/** Create missing tables and bring older databases up to the current schema. */
function prepare(d: Database): void {
  d.run(SCHEMA);
  d.run("UPDATE items SET color='Light gray' WHERE color='Gray'"); // color was renamed
  d.run("UPDATE items SET type='T-shirt' WHERE type IN ('Short sleeve T-shirt', 'Short sleeve t-shirt')"); // renamed
  d.run("UPDATE items SET type='Long T-shirt' WHERE type IN ('Long sleeve T-shirt', 'Long sleeve t-shirt')"); // renamed
  // migrate databases created before image/url existed
  const cols = d.exec('PRAGMA table_info(items)')[0].values.map((r) => r[1]);
  for (const col of ['image', 'url']) {
    if (!cols.includes(col)) d.run(`ALTER TABLE items ADD COLUMN ${col} TEXT NOT NULL DEFAULT ''`);
  }
}

export async function openDb(): Promise<void> {
  SQL = await initSqlJs({ locateFile: () => wasmUrl });
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
  db = saved ? new SQL.Database(fromBase64(saved)) : new SQL.Database();
  prepare(db);
}

/** The whole database as a SQLite file. */
export function exportDb(): Uint8Array {
  return db.export();
}

/** Replace the current database with an uploaded SQLite file. Throws if it is not a closet database. */
export function importDb(bytes: Uint8Array): void {
  const next = new SQL.Database(bytes);
  try {
    const has = next.exec("SELECT 1 FROM sqlite_master WHERE type='table' AND name='items'");
    if (has.length === 0) throw new Error('This file is not a Tansoo database.');
    prepare(next);
  } catch (e) {
    next.close();
    throw e;
  }
  db.close();
  db = next;
  persist();
}

function persist(): void {
  try {
    localStorage.setItem(STORAGE_KEY, toBase64(db.export()));
  } catch {
    /* storage unavailable or full */
  }
}

export function listItems(): ClothItem[] {
  const res = db.exec(
    'SELECT id, name, purchased_date, brand, type, color, cost, image, url FROM items',
  );
  if (res.length === 0) return [];
  return res[0].values.map((r) => ({
    id: r[0] as number,
    name: r[1] as string,
    purchasedDate: r[2] as string,
    brand: r[3] as string,
    type: r[4] as string,
    color: r[5] as string,
    cost: r[6] as number,
    image: r[7] as string,
    url: r[8] as string,
  }));
}

export function addItem(i: NewClothItem): void {
  db.run(
    'INSERT INTO items (name, purchased_date, brand, type, color, cost, image, url) VALUES (?,?,?,?,?,?,?,?)',
    [i.name, i.purchasedDate, i.brand, i.type, i.color, i.cost, i.image, i.url],
  );
  persist();
}

export function updateItem(i: ClothItem): void {
  db.run(
    'UPDATE items SET name=?, purchased_date=?, brand=?, type=?, color=?, cost=?, image=?, url=? WHERE id=?',
    [i.name, i.purchasedDate, i.brand, i.type, i.color, i.cost, i.image, i.url, i.id],
  );
  persist();
}

export function deleteItem(id: number): void {
  db.run('DELETE FROM items WHERE id=?', [id]);
  persist();
}
