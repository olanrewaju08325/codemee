import React, { useState } from 'react';
import { Mail, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { API_BASE_URL } from '../../apiClient';
import { Card } from '../ui/Card';

export const AdminEmailSettings = () => {
  const [testEmail, setTestEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null);

  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;
    setLoading(true);
    setResult(null);

    try {
      // Calling the backend to trigger a test email using server environment variables
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${API_BASE_URL}/api/admin/system/test-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ to_email: testEmail })
      });

      if (!response.ok) {
        throw new Error('Failed to send test email');
      }

      setResult({ success: true, message: `Test email successfully dispatched to ${testEmail}` });
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'Email service is temporarily unavailable.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Email / SMTP Configuration</h2>
        <p className="text-[var(--muted)]">Manage outbound email settings and test delivery.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">SMTP Status</h3>
                <p className="text-sm text-[var(--muted)]">Securely configured on backend</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted)]">SMTP Host</span>
                <span className="font-medium">Configured securely on server</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted)]">SMTP Port</span>
                <span className="font-medium">Configured securely on server</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted)]">SMTP Username</span>
                <span className="font-medium">Configured securely on server</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted)]">SMTP Password</span>
                <span className="font-mono text-xs px-2 py-1 bg-red-500/10 text-red-500 rounded border border-red-500/20">HIDDEN</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-[var(--muted)]">From Name</span>
                <span className="font-medium">CodeMe Academy</span>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-lg text-sm">
              Note: Do not expose SMTP credentials to the frontend. All email dispatches occur securely via the Render backend environment variables.
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Send Test Email</h3>
                <p className="text-sm text-[var(--muted)]">Verify your SMTP configuration</p>
              </div>
            </div>

            <form onSubmit={handleSendTest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Recipient Email Address</label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--surface-dark)] border border-[var(--border)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !testEmail}
                className="w-full py-2.5 rounded-lg bg-[var(--primary)] text-white font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                {loading ? 'Dispatching...' : 'Send Test Email'}
              </button>
            </form>

            {result && (
              <div className={`mt-6 p-4 rounded-lg border flex gap-3 ${result.success ? 'bg-green-500/10 border-green-500/30 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
                {result.success ? <CheckCircle size={20} className="shrink-0" /> : <XCircle size={20} className="shrink-0" />}
                <p className="text-sm">{result.message}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
