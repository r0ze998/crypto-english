// 録音は IndexedDB（この端末のこのブラウザ内）だけに保存する。外部送信はしない。

export interface StoredRecording {
  id: string;
  blob: Blob;
  mime: string;
  createdAt: string;
  /** 何を話した録音か（例: 文の英語） */
  label: string;
  /** 練習箇所の識別子（例: s01-meet:shadow） */
  contextKey: string;
}

const DB_NAME = 'crypto-english-recordings';
const STORE = 'recordings';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB が使えません'));
      return;
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: 'id' });
        os.createIndex('contextKey', 'contextKey');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  dbPromise.catch(() => {
    dbPromise = null;
  });
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, fn: (os: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        t.oncomplete = () => resolve(req.result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      }),
  );
}

export function putRecording(r: StoredRecording): Promise<IDBValidKey> {
  return tx('readwrite', (os) => os.put(r));
}

export function listRecordings(): Promise<StoredRecording[]> {
  return tx('readonly', (os) => os.getAll() as IDBRequest<StoredRecording[]>);
}

export async function recordingsFor(contextKey: string): Promise<StoredRecording[]> {
  const all = await tx('readonly', (os) => os.index('contextKey').getAll(contextKey) as IDBRequest<StoredRecording[]>);
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function deleteRecording(id: string): Promise<undefined> {
  return tx('readwrite', (os) => os.delete(id));
}

export function clearRecordings(): Promise<undefined> {
  return tx('readwrite', (os) => os.clear());
}
