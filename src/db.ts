import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import type { ClothItem, NewClothItem } from './types';

/** Thrown by importDb for files without an items table; callers show a translated message. */
export const NOT_TANSOO_DB = 'NOT_TANSOO_DB';

const STORAGE_KEY = 'smart-closet-db';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  purchased_date TEXT NOT NULL,
  brand TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL DEFAULT '',
  formality INTEGER NOT NULL DEFAULT 0,
  formality_manual INTEGER NOT NULL DEFAULT 0,
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
  for (const col of ['image', 'url', 'size']) {
    if (!cols.includes(col)) d.run(`ALTER TABLE items ADD COLUMN ${col} TEXT NOT NULL DEFAULT ''`);
  }
  if (!cols.includes('formality')) d.run('ALTER TABLE items ADD COLUMN formality INTEGER NOT NULL DEFAULT 0');
  if (!cols.includes('formality_manual')) {
    d.run('ALTER TABLE items ADD COLUMN formality_manual INTEGER NOT NULL DEFAULT 0');
    // before this flag existed 0 was the default, so only non-zero scores are known to be entered by hand
    d.run('UPDATE items SET formality_manual = 1 WHERE formality != 0');
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
    if (has.length === 0) throw new Error(NOT_TANSOO_DB);
    prepare(next);
  } catch (e) {
    next.close();
    throw e;
  }
  db.close();
  db = next;
  persist();
}

let onPersist: ((bytes: Uint8Array) => void) | null = null;

/** Called with the database bytes after every change (used to mirror to a file). */
export function setPersistListener(f: ((bytes: Uint8Array) => void) | null): void {
  onPersist = f;
}

function persist(): void {
  const bytes = db.export();
  try {
    localStorage.setItem(STORAGE_KEY, toBase64(bytes));
  } catch {
    /* storage unavailable or full */
  }
  onPersist?.(bytes);
}

export function listItems(): ClothItem[] {
  const res = db.exec(
    'SELECT id, name, purchased_date, brand, type, color, cost, image, url, size, formality, formality_manual FROM items',
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
    size: r[9] as string,
    formality: r[11] ? (r[10] as number) : null,
  }));
}

export function addItem(i: NewClothItem): void {
  db.run(
    'INSERT INTO items (name, purchased_date, brand, type, color, cost, image, url, size, formality, formality_manual) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
    [i.name, i.purchasedDate, i.brand, i.type, i.color, i.cost, i.image, i.url, i.size, i.formality ?? 0, i.formality === null ? 0 : 1],
  );
  persist();
}

export function updateItem(i: ClothItem): void {
  db.run(
    'UPDATE items SET name=?, purchased_date=?, brand=?, type=?, color=?, cost=?, image=?, url=?, size=?, formality=?, formality_manual=? WHERE id=?',
    [i.name, i.purchasedDate, i.brand, i.type, i.color, i.cost, i.image, i.url, i.size, i.formality ?? 0, i.formality === null ? 0 : 1, i.id],
  );
  persist();
}

export function deleteItem(id: number): void {
  db.run('DELETE FROM items WHERE id=?', [id]);
  persist();
}
