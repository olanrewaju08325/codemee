import React, { useEffect, useState } from 'react';
import {
  Bot, Mail, RefreshCw, Save, Loader2, CheckCircle2, XCircle,
  Users, MessageSquare, ClipboardCheck, AlertTriangle, Send,
} from 'lucide-react';
import { systemAPI, aiAPI } from '../../apiClient';

interface AIUsage {
  provider: string;
  groq_keys_configured: number;
  chat_today: number;
  chat_total: number;
  review_today: number;
  review_total: number;
  active_users_today: number;
  daily_limit: number;
  review_daily_limit: number;
  available: boolean;
}

interface EmailRow {
  to: string;
  subject: string | null;
  category: string;
  success: boolean;
  error: string | null;
  created_at: string;
}

interface SMTPUsage {
  configured: boolean;
  host: string;
  port: number;
  sent_today: number;
  failed_today: number;
  sent_total: number;
  failed_total: number;
  recent: EmailRow[];
  available: boolean;
}

const card: React.CSSProperties = {
  backgroundColor: 'var(--bg-surface)',
  border: '1px solid var(--border-default)',
  borderRadius: '14px',
  padding: '20px',
};

const Stat = ({ icon: Icon, label, value, accent }: { icon: any; label: string; value: React.ReactNode; accent: string }) => (
  <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '14px' }}>
    <div style={{ width: 44, height: 44, borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent, flexShrink: 0 }}>
      <Icon size={22} />
    </div>
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{value}</div>
    </div>
  </div>
);

const Pill = ({ ok, children }: { ok: boolean; children: React.ReactNode }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600,
    padding: '4px 10px', borderRadius: '999px',
    color: ok ? 'var(--color-success)' : 'var(--color-danger)',
    background: ok ? 'var(--color-success-bg)' : 'var(--color-danger-bg)',
  }}>
    {ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
    {children}
  </span>
);

export const AdminUsagePanel: React.FC = () => {
  const [ai, setAI] = useState<AIUsage | null>(null);
  const [smtp, setSMTP] = useState<SMTPUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [chatLimit, setChatLimit] = useState('');
  const [reviewLimit, setReviewLimit] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await systemAPI.getUsage();
      setAI(data.ai);
      setSMTP(data.smtp);
      setChatLimit(String(data.ai?.daily_limit ?? ''));
      setReviewLimit(String(data.ai?.review_daily_limit ?? ''));
    } catch (e: any) {
      setError(e?.message || 'Could not load usage data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveLimits = async (e: React.FormEvent) => {
    e.preventDefault();
    const daily = parseInt(chatLimit, 10);
    const review = parseInt(reviewLimit, 10);
    if (Number.isNaN(daily) || Number.isNaN(review) || daily < 0 || review < 0) {
      setSaveResult({ ok: false, msg: 'Enter valid non-negative numbers for both limits.' });
      return;
    }
    setSaving(true);
    setSaveResult(null);
    try {
      await aiAPI.updateSettings({ daily_limit: daily, review_daily_limit: review });
      setSaveResult({ ok: true, msg: 'Daily limits updated for all users.' });
      setAI((prev) => (prev ? { ...prev, daily_limit: daily, review_daily_limit: review } : prev));
    } catch (e: any) {
      setSaveResult({ ok: false, msg: e?.message || 'Failed to save limits.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', padding: '40px 0', justifyContent: 'center' }}>
        <Loader2 size={20} className="animate-spin" /> Loading usage data…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>AI &amp; Email Usage</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Live Groq (AI tutor) consumption and SMTP delivery, plus the per-user daily caps you control.
          </p>
        </div>
        <button
          onClick={load}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 14px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
        >
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {error && (
        <div style={{ ...card, borderColor: 'var(--color-danger)', color: 'var(--color-danger)', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* ---- AI (Groq) ---- */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <Bot size={18} style={{ color: 'var(--color-accent-500)' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>AI Tutor (Groq)</h3>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '3px 9px', borderRadius: '999px', background: 'var(--bg-surface-hover)', textTransform: 'capitalize' }}>
            {ai?.provider}
          </span>
          {ai && <Pill ok={ai.available && (ai.provider !== 'mock')}>{ai.groq_keys_configured} key{ai.groq_keys_configured === 1 ? '' : 's'} configured</Pill>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
          <Stat icon={MessageSquare} label="Tutor questions today" value={`${ai?.chat_today ?? 0}`} accent="var(--color-accent-500)" />
          <Stat icon={Users} label="Active AI users today" value={`${ai?.active_users_today ?? 0}`} accent="var(--color-secondary-500)" />
          <Stat icon={ClipboardCheck} label="AI reviews today" value={`${ai?.review_today ?? 0}`} accent="var(--color-primary-500)" />
          <Stat icon={Bot} label="Tutor questions all-time" value={`${ai?.chat_total ?? 0}`} accent="var(--color-accent-500)" />
        </div>
      </section>

      {/* ---- Daily limit control ---- */}
      <section style={card}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>Daily usage limits (all users)</h3>
        <p style={{ margin: '0 0 16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Caps how many AI actions each user gets per day. Applies immediately across the platform.
        </p>
        <form onSubmit={saveLimits} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Tutor questions / user / day
            <input
              type="number" min={0} value={chatLimit} onChange={(e) => setChatLimit(e.target.value)}
              style={{ width: '160px', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '15px' }}
            />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            AI reviews / user / day
            <input
              type="number" min={0} value={reviewLimit} onChange={(e) => setReviewLimit(e.target.value)}
              style={{ width: '160px', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-default)', background: 'var(--bg-app)', color: 'var(--text-primary)', fontSize: '15px' }}
            />
          </label>
          <button
            type="submit" disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 18px', borderRadius: '10px', border: 'none', background: 'var(--brand-gradient, var(--color-primary-500))', color: '#fff', cursor: saving ? 'default' : 'pointer', fontWeight: 700, fontSize: '14px', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving…' : 'Save limits'}
          </button>
        </form>
        {saveResult && (
          <div style={{ marginTop: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: saveResult.ok ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {saveResult.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {saveResult.msg}
          </div>
        )}
      </section>

      {/* ---- SMTP ---- */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <Mail size={18} style={{ color: 'var(--color-secondary-500)' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Email delivery (SMTP)</h3>
          {smtp && <Pill ok={smtp.configured}>{smtp.configured ? `${smtp.host}:${smtp.port}` : 'Not configured'}</Pill>}
          {smtp && !smtp.available && (
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Delivery log pending migration — showing zeros.</span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '18px' }}>
          <Stat icon={Send} label="Sent today" value={`${smtp?.sent_today ?? 0}`} accent="var(--color-success)" />
          <Stat icon={AlertTriangle} label="Failed today" value={`${smtp?.failed_today ?? 0}`} accent="var(--color-danger)" />
          <Stat icon={Mail} label="Sent all-time" value={`${smtp?.sent_total ?? 0}`} accent="var(--color-secondary-500)" />
          <Stat icon={XCircle} label="Failed all-time" value={`${smtp?.failed_total ?? 0}`} accent="var(--color-warning)" />
        </div>

        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-default)', fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)' }}>
            Recent delivery attempts
          </div>
          {(!smtp?.recent || smtp.recent.length === 0) ? (
            <div style={{ padding: '28px 18px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
              No email activity recorded yet.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '520px' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 18px', fontWeight: 600 }}>Recipient</th>
                    <th style={{ padding: '10px 18px', fontWeight: 600 }}>Category</th>
                    <th style={{ padding: '10px 18px', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '10px 18px', fontWeight: 600 }}>When</th>
                  </tr>
                </thead>
                <tbody>
                  {smtp.recent.map((r, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '10px 18px', color: 'var(--text-primary)' }}>
                        <div style={{ fontWeight: 600 }}>{r.to}</div>
                        {r.subject && <div style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{r.subject}</div>}
                      </td>
                      <td style={{ padding: '10px 18px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{r.category?.replace('_', ' ')}</td>
                      <td style={{ padding: '10px 18px' }}>
                        <Pill ok={r.success}>{r.success ? 'Sent' : 'Failed'}</Pill>
                        {!r.success && r.error && <div style={{ color: 'var(--text-tertiary)', fontSize: '11px', marginTop: '3px', maxWidth: '260px' }}>{r.error}</div>}
                      </td>
                      <td style={{ padding: '10px 18px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
