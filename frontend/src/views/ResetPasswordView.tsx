import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ResetPasswordView = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have an active session to reset password for
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError("Invalid or expired reset link.");
      }
    });
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

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'An error occurred updating your password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="full-screen-view theme-dark" style={{ background: 'radial-gradient(circle at center, #1b1030 0%, #07060d 100%)', minHeight: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: 'var(--space-6)', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <h2 style={{ fontFamily: 'var(--font-headings)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px', textAlign: 'center' }} className="gradient-text">
          Create New Password
        </h2>
        
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#86efac', marginBottom: '16px' }}>Password updated successfully!</div>
            <p style={{ color: 'var(--text-secondary)' }}>Redirecting to dashboard...</p>
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
