const CACHE='ic-pb001-be6c2b342c53b532';
const FILES=['./','./index.html','./main.js','./domain.js','./narrative.js','./storage.js','./scene.js','./audio.js','./style.css','./manifest.webmanifest','./assets/ember-camp.webp','./assets/northern-wall.webp','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-maskable.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ic-pb001-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('message',event=>{if(event.data==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  event.respondWith(caches.open(CACHE).then(async cache=>{const key=event.request.mode==='navigate'?new URL('./index.html',self.registration.scope).href:url.href;const cached=await cache.match(key);if(cached)return cached;try{return await fetch(event.request);}catch{return new Response('오프라인 파일을 찾지 못했습니다. 연결 후 앱을 다시 여세요.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}});}}));
});
