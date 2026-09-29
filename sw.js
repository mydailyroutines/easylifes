const CACHE="myroutine-v5";const A=["./","./index.html","./style.css","./app.js","./manifest.json"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(A).catch(()=>{})))});
self.addEventListener("activate",e=>e.waitUntil(clients.claim()));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))))});
