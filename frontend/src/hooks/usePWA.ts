import { useState, useEffect } from 'react'

// ── PWA install prompt hook ──────────────────────────────────────────────────
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.error('[PWA] Service Worker registration failed:', err)
      })
    }

    // Listen for browser install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Only show if user hasn't dismissed before
      const dismissed = localStorage.getItem('codeme_pwa_dismissed')
      if (!dismissed) setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler as any)

    return () => window.removeEventListener('beforeinstallprompt', handler as any)
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
      setDeferredPrompt(null)
    }
  }

  const dismissBanner = () => {
    setShowBanner(false)
    localStorage.setItem('codeme_pwa_dismissed', '1')
  }

  return { showBanner, installApp, dismissBanner }
}

// ── Push Notification helpers ────────────────────────────────────────────────

// URL-safe base64 (no padding) uncompressed P-256 public point.
// Must match the backend VAPID_PRIVATE_KEY.
function getVapidPublicKey(): string {
  return import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
}

export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    !!getVapidPublicKey()
  )
}

// iOS only supports web push when the PWA is installed to the Home Screen
// (iOS 16.4+; 17.4+ in the EU).
export function isIOS(): boolean {
  const ua = navigator.userAgent
  const isIOSDevice = /iPad|iPhone|iPod/.test(ua)
  const isiPadOSDesktop = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return isIOSDevice || isiPadOSDesktop
}

export function isRunningStandalone(): boolean {
  return (
    (navigator as any).standalone === true ||
    window.matchMedia('(display-mode: standalone)').matches
  )
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  return await Notification.requestPermission()
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null
  const reg = await navigator.serviceWorker.ready
  return await reg.pushManager.getSubscription()
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  try {
    const reg = await navigator.serviceWorker.ready
    const existing = await reg.pushManager.getSubscription()
    if (existing) return existing

    const vapidPublicKey = getVapidPublicKey()
    if (!vapidPublicKey) {
      console.error('[PWA] VITE_VAPID_PUBLIC_KEY is not configured')
      return null
    }

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })
    return subscription
  } catch (e) {
    console.error('[PWA] Push subscription failed:', e)
    return null
  }
}

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    if (!isPushSupported()) return true
    const reg = await navigator.serviceWorker.ready
    const existing = await reg.pushManager.getSubscription()
    if (!existing) return true
    return await existing.unsubscribe()
  } catch (e) {
    console.error('[PWA] Push unsubscribe failed:', e)
    return false
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(new ArrayBuffer(rawData.length))
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
