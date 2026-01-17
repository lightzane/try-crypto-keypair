export interface IIndexedDBConfig {
  dbName: string
  storeName: string

  /** @default 1 */
  dbVersion?: number
}

/**
 * Opens (or creates) an IndexedDB database and object store.
 *
 * @param config - Configuration for the IndexedDB database and store.
 * @returns A promise that resolves to the opened IDBDatabase instance.
 */
export async function openIDB(config: IIndexedDBConfig): Promise<IDBDatabase> {
  const dbName = config.dbName
  const dbVersion = config.dbVersion ?? 1
  const storeName = config.storeName

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName /* , { keyPath: 'id' } */)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
