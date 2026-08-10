import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PWAUpdater = () => {
  // Service Worker Registration for updates
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ', r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  // Install Prompt Logic
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install prompt automatically on mobile after a slight delay
      setTimeout(() => setShowInstall(true), 3000);
    };

    const handleManualInstallTrigger = () => {
      if (deferredPrompt) {
        setShowInstall(true);
      } else {
        alert("App is already installed or your browser doesn't support PWA installation.");
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('codeme-install', handleManualInstallTrigger);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('codeme-install', handleManualInstallTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    setShowInstall(false);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
  };

  const closeInstall = () => setShowInstall(false);
  const closeUpdate = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <>
      {/* Install App Popup */}
      <AnimatePresence>
        {showInstall && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            style={{
              position: 'fixed',
              bottom: 'var(--space-6)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-xl)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              width: '90%',
              maxWidth: '400px'
            }}
          >
            <div style={{
              background: 'var(--color-primary-500)',
              color: 'white',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)'
            }}>
              <Download size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>Install CodeMe App</h4>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Add to your home screen for faster, offline access.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <button 
                onClick={handleInstallClick}
                style={{
                  background: 'var(--color-primary-500)',
                  color: 'white',
                  border: 'none',
                  padding: 'var(--space-2) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 'var(--weight-medium)',
                  fontSize: 'var(--text-sm)'
                }}
              >
                Install
              </button>
              <button 
                onClick={closeInstall}
                style={{
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  border: 'none',
                  fontSize: 'var(--text-xs)',
                  cursor: 'pointer'
                }}
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Available Popup */}
      <AnimatePresence>
        {(needRefresh || offlineReady) && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            style={{
              position: 'fixed',
              top: 'var(--space-6)',
              right: 'var(--space-6)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-xl)',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              maxWidth: '350px'
            }}
          >
            <div style={{
              background: offlineReady ? 'var(--color-success)' : 'var(--color-primary-500)',
              color: 'white',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-full)'
            }}>
              {offlineReady ? <Download size={20} /> : <RefreshCw size={20} className="animate-spin-slow" />}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                {offlineReady ? 'App ready to work offline' : 'New update available!'}
              </h4>
              <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {offlineReady ? 'You can now use CodeMe without internet.' : 'Click reload to update to the latest version.'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {needRefresh && (
                <button 
                  onClick={() => updateServiceWorker(true)}
                  style={{
                    background: 'var(--color-primary-500)',
                    color: 'white',
                    border: 'none',
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontWeight: 'var(--weight-medium)',
                    fontSize: 'var(--text-xs)'
                  }}
                >
                  Reload
                </button>
              )}
              <button 
                onClick={closeUpdate}
                style={{
                  background: 'var(--bg-main)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  padding: 'var(--space-2)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
