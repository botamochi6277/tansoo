// Thin wrapper over the File System Access API (Chromium browsers) for keeping
// the database in a user-chosen .sqlite file. The file handle is remembered in
// IndexedDB so the file can be re-linked on the next visit.

type Permission = 'granted' | 'denied' | 'prompt';

export interface FileHandle {
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<{ write(data: BufferSource): Promise<void>; close(): Promise<void> }>;
  queryPermission(d: { mode: 'readwrite' }): Promise<Permission>;
  requestPermission(d: { mode: 'readwrite' }): Promise<Permission>;
}

interface FsWindow {
  showOpenFilePicker?: (o: unknown) => Promise<FileHandle[]>;
  showSaveFilePicker?: (o: unknown) => Promise<FileHandle>;
}

const w = window as unknown as FsWindow;
const FILE_TYPES = [
  { description: 'SQLite database', accept: { 'application/vnd.sqlite3': ['.sqlite', '.db'] } },
];

export const isSupported = (): boolean =>
  typeof w.showOpenFilePicker === 'function' && typeof w.showSaveFilePicker === 'function';

/** Ask the user to pick an existing database file. Returns null if they cancel. */
export async function pickExisting(): Promise<FileHandle | null> {
  try {
    const [h] = await w.showOpenFilePicker!({ types: FILE_TYPES });
    return h;
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return null;
    throw e;
  }
}

/** Ask the user where to create a new database file. Returns null if they cancel. */
export async function pickNew(): Promise<FileHandle | null> {
  try {
    return await w.showSaveFilePicker!({ suggestedName: 'tansoo.sqlite', types: FILE_TYPES });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return null;
    throw e;
  }
}

export async function readBytes(h: FileHandle): Promise<Uint8Array> {
  return new Uint8Array(await (await h.getFile()).arrayBuffer());
}

export async function writeBytes(h: FileHandle, bytes: Uint8Array): Promise<void> {
  const out = await h.createWritable();
  await out.write(bytes as BufferSource);
  await out.close();
}

/** Current permission, or a prompt to the user when `ask` is true (needs a click). */
export async function hasPermission(h: FileHandle, ask: boolean): Promise<boolean> {
  const opts = { mode: 'readwrite' } as const;
  if ((await h.queryPermission(opts)) === 'granted') return true;
  return ask && (await h.requestPermission(opts)) === 'granted';
}

// --- remembering the handle between visits ---------------------------------

const IDB_NAME = 'tansoo';
const STORE = 'handles';
const KEY = 'db-file';

function idb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function run<T>(mode: IDBTransactionMode, f: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const d = await idb();
  return new Promise((resolve, reject) => {
    const req = f(d.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function rememberHandle(h: FileHandle | null): Promise<void> {
  try {
    if (h) await run('readwrite', (s) => s.put(h, KEY));
    else await run('readwrite', (s) => s.delete(KEY));
  } catch {
    /* IndexedDB unavailable; the file just won't be re-linked next visit */
  }
}

export async function recallHandle(): Promise<FileHandle | null> {
  try {
    return ((await run('readonly', (s) => s.get(KEY))) as FileHandle | undefined) ?? null;
  } catch {
    return null;
  }
}
