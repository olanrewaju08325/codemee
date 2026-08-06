import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React ErrorBoundary:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', padding: '20px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--color-danger)' }}>Something went wrong.</h1>
          <p style={{ marginBottom: '24px', maxWidth: '500px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
            We encountered an unexpected error while loading this page. Our team has been notified.
          </p>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '8px', overflowX: 'auto', maxWidth: '80%', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
            <code style={{ color: 'var(--color-danger)', fontSize: '0.85rem' }}>
              {this.state.error?.toString()}
            </code>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn btn-primary"
            style={{ padding: '10px 24px', fontSize: '1rem' }}
          >
            Return to Dashboard
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
