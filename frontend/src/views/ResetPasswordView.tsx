import React, { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { Lock, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Pull the signed token our backend put in the reset link. We use a HashRouter,
// so the real query string lives after the '?' inside window.location.hash
// (e.g. #/reset-password?token=abc). Fall back to the normal search string too.
const readResetToken = (): string => {
  const fromHash = window.location.hash.split('?')[1] || '';
  const fromSearch = window.location.search.replace(/^\?/, '');
  const params = new URLSearchParams(fromHash || fromSearch);
  return params.get('token') || '';
};

export const ResetPasswordView = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const t = readResetToken();
    if (!t) {
      setError("This reset link is missing its security token. Please request a new one from the sign-in screen.");
    }
    setToken(t);
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("This reset link is invalid or has expired. Please request a new one.");
      setLoading(false);
      return;
    }

    try {
      const res = await apiClient.auth.resetPasswordWithToken(token, password);
      if (!res || !res.success) {
        setError((res && res.error) || "We couldn't update your password. The link may have expired — please request a new one.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err: any) {
      setError(err?.message || 'An error occurred updating your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="full-screen-view theme-dark" style={{ background: 'radial-gradient(circle at center, #1b1030 0%, #07060d 100%)', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: 'var(--space-6)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)' }}>
        <h2 style={{ fontFamily: 'var(--font-headings)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px', textAlign: 'center' }} className="gradient-text">
          Create New Password
        </h2>
        
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#86efac', marginBottom: '16px' }}>Password updated successfully!</div>
            <p style={{ color: 'var(--text-secondary)' }}>Redirecting you to sign in...</p>
          </div>
        ) : (
          <>
            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label>NEW PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input 
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

              <div className="form-group">
                <label>CONFIRM PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                  <input 
                    type="password" 
                    className="input-field" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ paddingLeft: '44px' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '8px' }}>
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Update Password <ArrowRight size={18} /></>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
