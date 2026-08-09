// Offline course library.
//
// Stores a course's lesson content in IndexedDB and any direct-file media
// (mp4/webm/pdf...) in the Cache Storage API, so a student can read a
// downloaded course with no connection. External embeds (YouTube, Google
// Drive, Zoom, Vimeo) can't be downloaded and stay online-only — the UI marks
// them as such. Every entry point is feature-detected and wrapped so a device
// without IndexedDB/Cache Storage degrades gracefully instead of crashing.

const DB_NAME = 'codeme-offline-v1'
const DB_VERSION = 1
const STORE = 'courses'
const MEDIA_CACHE = 'codeme-offline-media'

export interface OfflineCourse {
  id: string
  title: string
  downloadedAt: number
  modules: any[]
  lessons: any[]
  mediaUrls: string[]
}

export function offlineSupported(): boolean {
  return typeof indexedDB !== 'undefined'
}

// A URL is downloadable only if it's a direct media/document file — not an
// embed we can never store offline.
export function isDownloadableMedia(url?: string | null): boolean {
  if (!url) return false
  const u = url.toLowerCase()
  if (/(youtube|youtu\.be|vimeo|drive\.google|docs\.google|zoom\.us|meet\.google|dailymotion|loom\.com)/.test(u)) {
    return false
  }
  return /\.(mp4|webm|ogg|m4v|mov|mp3|wav|pdf)(\?|#|$)/.test(u)
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function run<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode)
        const req = fn(t.objectStore(STORE))
        req.onsuccess = () => resolve(req.result as T)
        req.onerror = () => reject(req.error)
        t.oncomplete = () => db.close()
      })
  )
}

// Persist a course for offline use. Media caching is best-effort: a failed
// file never blocks saving the readable text content.
export async function downloadCourse(course: OfflineCourse): Promise<void> {
  if (!offlineSupported()) throw new Error('Offline storage is not available on this device.')

  const media = (course.mediaUrls || []).filter(isDownloadableMedia)
  if (media.length && 'caches' in window) {
    try {
      const cache = await caches.open(MEDIA_CACHE)
      await Promise.all(media.map((url) => cache.add(url).catch(() => {})))
    } catch {
      /* media caching is optional */
    }
  }

  await run('readwrite', (store) => store.put({ ...course, downloadedAt: Date.now() }))
}

export async function getOfflineCourse(id: string): Promise<OfflineCourse | null> {
  if (!offlineSupported()) return null
  try {
    return (await run<OfflineCourse>('readonly', (s) => s.get(id))) || null
  } catch {
    return null
  }
}

export async function listOfflineCourses(): Promise<OfflineCourse[]> {
  if (!offlineSupported()) return []
  try {
    return (await run<OfflineCourse[]>('readonly', (s) => s.getAll())) || []
  } catch {
    return []
  }
}

export async function isCourseDownloaded(id: string): Promise<boolean> {
  return !!(await getOfflineCourse(id))
}

export async function removeOfflineCourse(id: string): Promise<void> {
  if (!offlineSupported()) return
  const course = await getOfflineCourse(id)
  if (course && 'caches' in window) {
    try {
      const cache = await caches.open(MEDIA_CACHE)
      await Promise.all((course.mediaUrls || []).map((u) => cache.delete(u).catch(() => {})))
    } catch {
      /* ignore */
    }
  }
  try {
    await run('readwrite', (s) => s.delete(id))
  } catch {
    /* ignore */
  }
}

// Return an object URL for a cached media file, or null if it isn't stored.
// Caller is responsible for URL.revokeObjectURL when done.
export async function getCachedMediaURL(url: string): Promise<string | null> {
  if (!('caches' in window)) return null
  try {
    const cache = await caches.open(MEDIA_CACHE)
    const res = await cache.match(url)
    if (!res) return null
    return URL.createObjectURL(await res.blob())
  } catch {
    return null
  }
}
