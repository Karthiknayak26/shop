// Service Worker Registration Utility for Kandukuru Supermarket

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/sw.js`;

      if (isLocalhost) {
        // This is running on localhost. Check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
            'worker. To learn more, visit https:/\/bit.ly/CRA-PWA'
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                'New content is available and will be used when all ' +
                'tabs for this page are closed. See https:/\/bit.ly/CRA-PWA.'
              );

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('Content is cached for offline use.');

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

// Service Worker Update Handler
export function handleServiceWorkerUpdate() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SKIP_WAITING') {
        navigator.serviceWorker.controller?.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  }
}

// Check for service worker updates
export function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.update();
    });
  }
}

// Get service worker status
export function getServiceWorkerStatus() {
  if (!('serviceWorker' in navigator)) {
    return 'not-supported';
  }

  if (navigator.serviceWorker.controller) {
    return 'active';
  }

  if (navigator.serviceWorker.ready) {
    return 'ready';
  }

  return 'registering';
}

// Request notification permission
export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Send notification
export function sendNotification(title, options = {}) {
  if (Notification.permission === 'granted') {
    return new Notification(title, {
      icon: '/logo192.png',
      badge: '/logo192.png',
      ...options
    });
  }
  return null;
}

// Background sync registration
export async function registerBackgroundSync(tag, options = {}) {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag, options);
      return true;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }
  return false;
}

// Service Worker Lifecycle Events
export function addServiceWorkerLifecycleListeners() {
  if ('serviceWorker' in navigator) {
    // Service Worker installing
    navigator.serviceWorker.addEventListener('installing', (event) => {
      console.log('Service Worker installing...');
    });

    // Service Worker installed
    navigator.serviceWorker.addEventListener('installed', (event) => {
      console.log('Service Worker installed');
    });

    // Service Worker activating
    navigator.serviceWorker.addEventListener('activating', (event) => {
      console.log('Service Worker activating...');
    });

    // Service Worker activated
    navigator.serviceWorker.addEventListener('activated', (event) => {
      console.log('Service Worker activated');
    });

    // Service Worker error
    navigator.serviceWorker.addEventListener('error', (event) => {
      console.error('Service Worker error:', event.error);
    });

    // Service Worker message
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Service Worker message:', event.data);
    });
  }
}

// Initialize service worker with all features
export function initializeServiceWorker(config = {}) {
  // Register service worker
  register(config);

  // Handle updates
  handleServiceWorkerUpdate();

  // Add lifecycle listeners
  addServiceWorkerLifecycleListeners();

  // Check for updates periodically
  setInterval(checkForUpdates, 1000 * 60 * 60); // Check every hour

  console.log('Service Worker initialization completed');
}
