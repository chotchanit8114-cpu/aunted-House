/* หอผีสิง service worker : เล่นออฟไลน์ได้หลังเปิดครั้งแรก
   อัปเดตเกมแล้วให้เปลี่ยนเลข V เพื่อบังคับโหลดใหม่ */
const V = 'hd-v15', CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
    const r = e.request;
    if (r.method !== 'GET') return;
    const u = new URL(r.url);
    if (u.origin !== location.origin) {
        /* ฟอนต์/ไลบรารีภายนอก: เก็บแคชไว้ใช้ตอนออฟไลน์ (PeerJS ออนไลน์เท่านั้น) */
        if (/fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com/.test(u.host))
            e.respondWith(caches.open(V).then(c => c.match(r).then(h => h || fetch(r).then(n => { if (n.ok || n.type === 'opaque') c.put(r, n.clone()); return n; }).catch(() => h))));
        return;
    }
    /* หน้าเกม: เอาของใหม่จากเน็ตก่อน ไม่มีเน็ตใช้ที่แคช */
    e.respondWith(fetch(r).then(n => { if (n.ok) { const c = n.clone(); caches.open(V).then(x => x.put(r, c)); } return n; }).catch(() => caches.match(r).then(h => h || caches.match('index.html'))));
});
