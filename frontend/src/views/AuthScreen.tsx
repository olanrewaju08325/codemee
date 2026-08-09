import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { gsap } from 'gsap'
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react'

interface AuthScreenProps {
  onAuthSuccess: (session: any) => void
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [consent, setConsent] = useState(false)
  const [ageConfirm, setAgeConfirm] = useState(false)
  const [view, setView] = useState<'signin' | 'signup' | 'forgot'>('signin')
  
  const logoRef = useRef<HTMLImageElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // GSAP Cinematic Entrance Animation
    if (logoRef.current && formRef.current) {
      gsap.fromTo(logoRef.current, 
        { scale: 0.8, y: -30 },
        { scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.7)' }
      )
      gsap.fromTo(formRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, delay: 0.4, ease: 'power2.out' }
      )
    }
  }, [view])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (view === 'signup') {
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.')
          setLoading(false)
          return
        }
        if (!ageConfirm) {
          setError('You must confirm you are 13 years of age or older.')
          setLoading(false)
          return
        }
        if (!consent) {
          setError('You must consent to CodeMe Academy\'s data use policy.')
          setLoading(false)
          return
        }
        // Sign Up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: '', // Will be updated during onboarding
            }
          }
        })
        if (signUpError) throw signUpError
        
        if (data.session) {
          onAuthSuccess(data.session)
        } else {
          setMessage("Account created! Please check your email for the confirmation link.")
        }
      } else if (view === 'signin') {
        // Sign In
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (signInError) throw signInError
        if (data.session) {
          onAuthSuccess(data.session)
        }
      } else if (view === 'forgot') {
        // Forgot Password
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/#/reset-password`,
        });
        if (resetError) throw resetError
        setMessage("Password reset instructions have been sent to your email.");
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="full-screen-view theme-dark" style={{ background: 'radial-gradient(circle at center, #1b1030 0%, #07060d 100%)', minHeight: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
        <img 
          ref={logoRef}
          src="/codeme.jpg" 
          alt="CodeMe Logo" 
          className="splash-logo" 
        />
        <h2 style={{ fontFamily: 'var(--font-headings)', fontSize: '1.75rem', fontWeight: 800, marginTop: '16px' }} className="gradient-text">
          {view === 'signup' ? 'Join CodeMe' : view === 'signin' ? 'Welcome Back' : 'Reset Password'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
          {view === 'signup' ? 'Start your tech journey in Nigeria' : view === 'signin' ? 'Sign in to access your dashboard' : 'Enter your email to receive reset instructions'}
        </p>
      </div>

      <div ref={formRef} style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-surface)', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-default)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
        {error && (
          <div 
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.15)', 
              color: '#FCA5A5', 
              padding: '12px 16px', 
              borderRadius: '12px', 
              fontSize: '0.85rem', 
              marginBottom: '16px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}
          >
            {error}
          </div>
        )}

        {message && (
          <div 
            style={{ 
              backgroundColor: 'rgba(34, 197, 94, 0.15)', 
              color: '#86efac', 
              padding: '12px 16px', 
              borderRadius: '12px', 
              fontSize: '0.85rem', 
              marginBottom: '16px',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label htmlFor="email">EMAIL ADDRESS</label>
            <div style={{ position: 'relative' }}>
              <Mail 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '14px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-tertiary)' 
                }} 
              />
              <input 
                id="email"
                type="email" 
                className="input-field" 
                placeholder="email@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          {view !== 'forgot' && (
            <div className="form-group">
              <label htmlFor="password">PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <Lock 
                  size={18} 
                  style={{ 
                    position: 'absolute', 
                    left: '14px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--text-tertiary)' 
                  }} 
                />
                <input 
                  id="password"
                  type="password" 
                  className="input-field" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '44px' }}
                />
              </div>
            </div>
          )}

          {view === 'signin' && (
            <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '8px' }}>
              <button 
                type="button"
                onClick={() => setView('forgot')}
                style={{ background: 'none', border: 'none', fontSize: '0.75rem', color: 'var(--color-cyan)', textDecoration: 'none', fontWeight: 600, cursor: 'pointer' }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {view === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '4px 0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <input 
                  id="ageConfirm"
                  type="checkbox" 
                  checked={ageConfirm}
                  onChange={(e) => setAgeConfirm(e.target.checked)}
                  required
                  style={{ marginTop: '3px', cursor: 'pointer' }}
                />
                <label htmlFor="ageConfirm" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, cursor: 'pointer' }}>
                  I confirm I am 13 years of age or older.
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <input 
                  id="consent"
                  type="checkbox" 
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  required
                  style={{ marginTop: '3px', cursor: 'pointer' }}
                />
                <label htmlFor="consent" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, cursor: 'pointer' }}>
                  I agree to CodeMe Academy's use of my name, submitted work, and profile information for learning and academy purposes.
                </label>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || (view === 'signup' && (!consent || !ageConfirm))}
            style={{ marginTop: '8px' }}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {view === 'signup' ? 'Create Account' : view === 'signin' ? 'Sign In' : 'Send Reset Link'}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {view === 'forgot' ? (
            <button
              onClick={() => setView('signin')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-cyan)',
                fontFamily: 'var(--font-headings)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Back to Sign In
            </button>
          ) : (
            <button
              onClick={() => setView(view === 'signup' ? 'signin' : 'signup')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-cyan)',
                fontFamily: 'var(--font-headings)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {view === 'signup' ? 'Already have an account? Sign In' : "Don't have an account? Create Account"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
