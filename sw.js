const CACHE_NAME = 'bluewhite-ai-cache-v19';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  // Local files
  '/index.tsx',
  '/App.tsx',
  '/config.ts',
  '/types.ts',
  '/services/geminiService.ts',
  '/services/virtualFileSystem.ts',
  '/services/userService.ts',
  '/services/systemHardwareService.ts',
  '/services/emailService.ts',
  '/services/liveService.ts',
  '/services/youtubeService.ts',
  '/services/calendarService.ts',
  '/services/adsenseService.ts',
  '/services/nativeFileSystem.ts',
  '/services/projectService.ts',
  '/services/chatService.ts',
  '/services/googleDriveService.ts',
  '/hooks/usePwaInstall.ts',
  '/hooks/useSpeechRecognition.ts',
  '/hooks/useSpeechSynthesis.ts',
  '/components/BlueOrb.tsx',
  '/components/ChatLog.tsx',
  '/components/ActionPanel.tsx',
  '/components/Icons.tsx',
  '/components/NavBar.tsx',
  '/components/BrowserView.tsx',
  '/components/CodeEditorView.tsx',
  '/components/NetworkView.tsx',
  '/components/AuthView.tsx',
  '/components/UserMenu.tsx',
  '/components/DeployView.tsx',
  '/components/FileExplorerView.tsx',
  '/components/DriversView.tsx',
  '/components/SetupView.tsx',
  '/components/ScriptWriterView.tsx',
  '/components/EmailView.tsx',
  '/components/DocumentReaderView.tsx',
  '/components/VoiceChatView.tsx',
  '/components/MusicPlayerView.tsx',
  '/components/InstallerCreatorView.tsx',
  '/components/CalendarView.tsx',
  '/components/AdMobView.tsx',
  '/components/FacebookAdsView.tsx',
  '/components/SystemAnalyzerView.tsx',
  '/components/SelfUpdateView.tsx',
  '/components/MapView.tsx',
  // Key external assets
  'https://cdn.tailwindcss.com',
  'https://www.gstatic.com/images/branding/product/1x/google_gemini_256dp.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || event.request.url.includes('googleapis.com') || event.request.url.includes('accounts.google.com')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
            console.error('Fetch failed; returning offline page instead.', err);
        });
        return response || fetchPromise;
      });
    })
  );
});