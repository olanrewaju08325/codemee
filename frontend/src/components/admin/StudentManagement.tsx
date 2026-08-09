import React, { useState, useEffect } from 'react';
import { Search, Loader2, UserX, Key, X, RefreshCw, Copy, Check } from 'lucide-react';
import apiClient from '../../apiClient';

// Build a readable, reasonably strong temporary password the admin can relay
// to the student (no ambiguous chars like O/0/l/1).
const genTempPassword = (): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const pick = () => chars[Math.floor(Math.random() * chars.length)];
  return Array.from({ length: 10 }, pick).join('');
};

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Admin password-reset modal state.
  const [resetTarget, setResetTarget] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const openReset = (student: any) => {
    setResetTarget(student);
    setNewPassword(genTempPassword());
    setResetError(null);
    setResetDone(false);
    setCopied(false);
  };

  const closeReset = () => {
    setResetTarget(null);
    setNewPassword('');
    setResetError(null);
    setResetDone(false);
    setResetLoading(false);
    setCopied(false);
  };

  const submitReset = async () => {
    if (!resetTarget?.email) {
      setResetError("This student has no email on file, so their password can't be reset here.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }
    setResetLoading(true);
    setResetError(null);
    try {
      const res = await apiClient.admin.resetPassword({ email: resetTarget.email, new_password: newPassword });
      if (res && res.success) {
        setResetDone(true);
      } else {
        setResetError("The password couldn't be updated. Make sure this student has a valid account, then try again.");
      }
    } catch (e) {
      setResetError('Something went wrong updating the password. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be blocked; the password is visible on screen regardless.
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await apiClient.admin.getStudents(search).catch(() => []);
      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>Student Management</h2>
        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search students..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
        </form>
      </div>

      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <tr>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-default)' }}>Student</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-default)' }}>ID</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-default)' }}>Role</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-default)' }}>Status</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-default)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center' }}><Loader2 className="animate-spin mx-auto" /></td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No students found.</td></tr>
            ) : (
              students.map(student => (
                <tr key={student.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 'bold' }}>{student.full_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{student.email || 'No email'}</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>{student.student_id || 'N/A'}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>{student.role || 'student'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981' }}>Active</span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => openReset(student)} style={{ padding: '6px', background: 'none', border: '1px solid var(--border-default)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)' }} title="Reset Password"><Key size={14} /></button>
                      <button style={{ padding: '6px', background: 'none', border: '1px solid var(--border-default)', borderRadius: '4px', cursor: 'pointer', color: 'var(--color-red)' }} title="Suspend Account"><UserX size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {resetTarget && (
        <div
          onClick={closeReset}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '420px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-lg)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>Reset Password</h3>
              <button onClick={closeReset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} title="Close"><X size={18} /></button>
            </div>

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              {resetTarget.full_name || 'Student'}<br />
              <span style={{ fontFamily: 'monospace' }}>{resetTarget.email || 'No email on file'}</span>
            </div>

            {resetDone ? (
              <>
                <div style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#34D399', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Password updated. Share the new password below with the student — ask them to sign in and change it afterwards.
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <code style={{ flex: 1, padding: '12px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-default)', borderRadius: '8px', fontSize: '1rem', letterSpacing: '1px', wordBreak: 'break-all' }}>{newPassword}</code>
                  <button onClick={copyPassword} className="btn" style={{ padding: '10px', border: '1px solid var(--border-default)', borderRadius: '8px', cursor: 'pointer', background: 'none', color: 'var(--text-primary)' }} title="Copy password">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <button onClick={closeReset} className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>Done</button>
              </>
            ) : (
              <>
                {resetError && (
                  <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                    {resetError}
                  </div>
                )}

                <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>NEW PASSWORD</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'monospace', letterSpacing: '1px' }}
                  />
                  <button onClick={() => setNewPassword(genTempPassword())} style={{ padding: '10px', border: '1px solid var(--border-default)', borderRadius: '8px', cursor: 'pointer', background: 'none', color: 'var(--text-primary)' }} title="Generate a new password"><RefreshCw size={16} /></button>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={closeReset} className="btn" style={{ flex: 1, border: '1px solid var(--border-default)', background: 'none', color: 'var(--text-primary)' }} disabled={resetLoading}>Cancel</button>
                  <button onClick={submitReset} className="btn btn-primary" style={{ flex: 1 }} disabled={resetLoading}>
                    {resetLoading ? <Loader2 className="animate-spin" size={18} /> : 'Set Password'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
