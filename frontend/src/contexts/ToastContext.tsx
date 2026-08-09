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
  const accent = (kind: ToastKind) =>
    kind === 'error' ? 'var(--color-danger)' : kind === 'success' ? 'var(--color-success)' : 'var(--color-info)'
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        style={{
          position: 'fixed',
          zIndex: 600,
          top: 'calc(16px + var(--safe-area-top))',
          right: 16,
          left: 16,
          display: 'grid',
          gap: 10,
          justifyItems: 'end',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(toast => {
          const Icon = icons[toast.kind]
          return (
            <div
              key={toast.id}
              role="status"
              className="view-enter"
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                width: 'min(360px, 100%)',
                padding: '14px 16px',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-default)',
                borderLeft: `3px solid ${accent(toast.kind)}`,
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <Icon size={19} color={accent(toast.kind)} style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ flex: 1, fontSize: 'var(--text-sm)', lineHeight: 1.4 }}>{toast.message}</span>
              <button
                onClick={() => setToasts(current => current.filter(item => item.id !== toast.id))}
                aria-label="Dismiss notification"
                style={{ border: 0, background: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 0 }}
              >
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
