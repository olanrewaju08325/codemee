import React, { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

type ToastKind = 'success' | 'error' | 'info'
type Toast = { id: number; message: string; kind: ToastKind }
const ToastContext = createContext<{ showToast: (message: string, kind?: ToastKind) => void } | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const showToast = useCallback((message: string, kind: ToastKind = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(current => [...current, { id, message, kind }])
    window.setTimeout(() => setToasts(current => current.filter(toast => toast.id !== id)), 4500)
  }, [])
  const icons = { success: CheckCircle2, error: AlertCircle, info: Info }
  return <ToastContext.Provider value={{ showToast }}>{children}<div aria-live="polite" style={{ position: 'fixed', zIndex: 10000, top: 18, right: 18, display: 'grid', gap: 10, maxWidth: 'min(360px, calc(100vw - 36px))' }}>{toasts.map(toast => { const Icon = icons[toast.kind]; return <div key={toast.id} role="status" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '14px 16px', background: 'var(--bg-surface)', color: 'var(--text-primary)', border: `1px solid ${toast.kind === 'error' ? '#ef4444' : toast.kind === 'success' ? '#10b981' : 'var(--border-default)'}`, borderRadius: 12, boxShadow: '0 12px 30px rgba(0,0,0,.18)' }}><Icon size={19} color={toast.kind === 'error' ? '#ef4444' : toast.kind === 'success' ? '#10b981' : 'var(--color-blue)'} /><span style={{ flex: 1, fontSize: '.9rem', lineHeight: 1.4 }}>{toast.message}</span><button onClick={() => setToasts(current => current.filter(item => item.id !== toast.id))} aria-label="Dismiss notification" style={{ border: 0, background: 'none', color: 'inherit', cursor: 'pointer', padding: 0 }}><X size={16} /></button></div> })}</div></ToastContext.Provider>
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
