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

  // * Create indexes so that we can speed up queries later (example: `expiresAt` index)
  // For convenience, define same name for `index` and `field`
  const indexName = 'eat' // (expiresAt) to be called by store.index('eat')
  const indexField = 'eat' // keyPath or field or property stored in the object store

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion)

    // .onupgradeneeded is called when the database is created or a higher version number than the existing stored database is used
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(storeName)) {
        // You can create multiple object stores in a single database
        const store = db.createObjectStore(storeName /* , { keyPath: 'id' } */)
        // const store2 = db.createObjectStore('store2') // Example of another object store

        // You can create multiple indexes in a single object store
        store.createIndex(indexName, indexField, { unique: false }) // ! Data may have same expiresAt value
        // store2.createIndex('anotherIndex', 'anotherField', { unique: true }) // Example of another index
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
