// PC Desktop Suite - Windows Service Worker (Offline & PWA Cache)
const CACHE_NAME = "pc-desktop-suite-v1";

const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon.svg",
  "/pwa-192x192.png",
  "/pwa-512x512.png",
  "/pwa-maskable-512x512.png",
  "/apple-touch-icon.png",
  "/favicon.ico"
];

// Install: precache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("PWA: Failed to precache some assets:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: offline strategy
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // If API request fails offline, provide fallback mock system metrics
  if (url.pathname === "/api/system-info") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            cpuPercent: 18,
            cpuModel: "Intel(R) Core(TM) i7-13700H (Offline Mode)",
            cpuCores: 8,
            cpuThreads: 16,
            cpuGen: "13th Gen Multi-Core x64",
            cpuFreqGHz: 3.4,
            perCoreUsage: [18, 14, 22, 19, 15, 25, 12, 18],
            ramPercent: 42,
            ramTotalGB: 16.0,
            ramUsedGB: 6.7,
            ramFreeGB: 9.3,
            romPercent: 54,
            romTotalGB: 512,
            romUsedGB: 276,
            romFreeGB: 236,
            driveC: { total: 256, used: 142, free: 114, percent: 55, label: "OS Disk (C:)" },
            driveD: { total: 256, used: 134, free: 122, percent: 52, label: "Data Disk (D:)" },
            battery: { percent: 96, isCharging: true, powerSource: "AC Adapter (Connected)" },
            osName: "Microsoft Windows 11 Pro 64-bit",
            osArch: "x64 (Intel/AMD)",
            osUptime: "3h 42m",
            powerProfile: "Performance",
            offlineFallback: true
          }),
          {
            headers: { "Content-Type": "application/json" }
          }
        );
      })
    );
    return;
  }

  // PDF extract API endpoint can only work online or returns offline error
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Navigation requests (HTML)
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match("/index.html") || caches.match("/");
      })
    );
    return;
  }

  // Cache-first / stale-while-revalidate for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch in background to update cache
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback for image requests
        if (event.request.destination === "image") {
          return caches.match("/icon.svg");
        }
      });
    })
  );
});
