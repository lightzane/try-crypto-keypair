import { IIndexedDBConfig, openIDB } from '~/utils/open-idb'

export function useIndexedDB(config: IIndexedDBConfig) {
  const { storeName } = config

  async function putAsync(key: string | number, value: Object, expiresAt?: number) {
    const db = await openIDB(config)

    if (typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('Value must be an object')
    }

    // If expiresAt is provided, include it in the stored object
    // Note: `eat` stands for 'expires at' and index must be created during DB setup
    value = expiresAt ? { ...value, eat: expiresAt } : value

    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(value, key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async function getAsync<T>(key: string | number): Promise<T | undefined> {
    const db = await openIDB(config)

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const result = request.result

        if (result && result.eat && Date.now() > result.eat) {
          deleteAsync(key)
          resolve(undefined)
          return
        }

        resolve(result as T)
      }
    })
  }

  async function deleteAsync(key: string | number) {
    const db = await openIDB(config)

    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async function cleanupExpiredAsync(batchSize = 1000) {
    const db = await openIDB(config)

    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)

      // * Check expired items using 'eat' index
      // ! 'eat' index must exist (during DB setup / onupgradeneeded)
      const index = store.index('eat')
      const now = Date.now()
      const range = IDBKeyRange.upperBound(now) // Find all expired items (eat <= now)
      const request = index.openCursor(range)

      let deletedCount = 0

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor && deletedCount < batchSize) {
          deletedCount++
          cursor.delete() // Delete the expired item
          cursor.continue() // Move to the next item (triggers `onsuccess` again)
        } else {
          resolve()
        }
      }
    })
  }

  return {
    putAsync,
    getAsync,
    deleteAsync,
    cleanupExpiredAsync,
  }
}
