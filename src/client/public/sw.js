const CACHE = 'hms-v3';
const STATIC = ['/', '/manifest.json', '/sw.js'];
const API_CACHE = 'hms-api-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  if (url.pathname.startsWith('/api/checkin/scan') && e.request.method === 'POST') {
    // Check-in: attempt network, queue for retry if offline
    e.respondWith(
      fetch(e.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(API_CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(async () => {
        // Queue for background sync
        const body = await e.request.clone().text();
        const db = await openDB();
        await db.add('sync-queue', { url: e.request.url, method: 'POST', body, timestamp: Date.now() });
        return new Response(JSON.stringify({ queued: true, message: 'Check-in will sync when online' }), {
          status: 202, headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(API_CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match(e.request).then((r) => r || new Response(JSON.stringify({ error:'offline' }), { status:503 })))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetchPromise = fetch(e.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached || new Response('Offline', { status:503 }));
      return cached || fetchPromise;
    })
  );
});

self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-checkins') {
    e.waitUntil(processSyncQueue());
  }
});

async function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('hms-sync', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('sync-queue')) {
        db.createObjectStore('sync-queue', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function processSyncQueue() {
  const db = await openDB();
  const tx = db.transaction('sync-queue', 'readwrite');
  const store = tx.objectStore('sync-queue');
  const items = await new Promise((resolve) => {
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
  });
  for (const item of items) {
    try {
      await fetch(item.url, { method: item.method, body: item.body, headers: { 'Content-Type': 'application/json' } });
      store.delete(item.id);
    } catch {}
  }
}
