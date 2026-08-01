import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// ── Service worker: caches the app shell for fast/offline loads and tells
// App.jsx when a new deployment is ready, so it can prompt the user to
// refresh instead of silently staying on stale content — this matters most
// for iOS "Add to Home Screen" installs, which can otherwise go a long
// time without ever re-fetching index.html. App.jsx listens for
// 'jb-sw-update-available' and dispatches 'jb-sw-apply-update' in response
// to the user tapping the update banner. ──
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Only interrupt the user for deploys the SW itself flags as
    // significant (NOTIFY_VERSION, bumped by hand — see
    // public/service-worker.js) — routine content-only pushes still
    // install and take over normally, just silently on the next full
    // close+reopen instead of showing the banner.
    const getNotifyVersion = worker => new Promise(resolve => {
      const channel = new MessageChannel();
      channel.port1.onmessage = e => resolve(e.data);
      worker.postMessage({ type: 'GET_NOTIFY_VERSION' }, [channel.port2]);
    });

    navigator.serviceWorker.register('/service-worker.js').then(reg => {
      const notifyIfWaiting = () => {
        if (!reg.waiting) return;
        getNotifyVersion(reg.waiting).then(v => {
          const seen = parseInt(localStorage.getItem('jb_sw_notify_seen') || '0', 10);
          if (v > seen) {
            localStorage.setItem('jb_sw_notify_seen', String(v));
            window.dispatchEvent(new CustomEvent('jb-sw-update-available'));
          }
        }).catch(() => {});
      };
      notifyIfWaiting();

      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            notifyIfWaiting();
          }
        });
      });

      let reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloading) return;
        reloading = true;
        window.location.reload();
      });

      window.addEventListener('jb-sw-apply-update', () => {
        if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      });

      // Home-screen apps can sit open/suspended far longer than a normal
      // browser tab, so check for updates proactively rather than only on
      // the next full navigation.
      const checkForUpdate = () => reg.update().catch(() => {});
      setInterval(checkForUpdate, 60 * 1000);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate();
      });
    }).catch(() => {});
  });
}
