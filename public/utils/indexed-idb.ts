import { IIndexedDBConfig, openIDB } from '~/utils/open-idb'

export function useIndexedDB(config: IIndexedDBConfig) {
  const { storeName } = config

  async function putAsync(key: string | number, value: any) {
    const db = await openIDB(config)

    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(value, key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async function getAsync<T>(key: string | number): Promise<T> {
    const db = await openIDB(config)

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result as T)
      request.onerror = () => reject(request.error)
    })
  }

  async function deleteAsync(key: string | number) {
    const db = await openIDB(config)
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  return {
    putAsync,
    getAsync,
    deleteAsync,
  }
}
