import { useState, useEffect } from "react";
import { Search, Ban, Key, X, RefreshCw, Copy, Check, Loader2, Eye, User as UserIcon, Mail } from "lucide-react";
import apiClient from "../../apiClient";

const genTempPassword = (): string => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  const pick = () => chars[Math.floor(Math.random() * chars.length)];
  return Array.from({ length: 10 }, pick).join('');
};

import { adminAPI } from "../../apiClient";
import { useToast } from "../../contexts/ToastContext";

export const UserManagementTable = ({ roleFilter }: { roleFilter?: 'student' | 'teacher' | 'admin' }) => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Admin password-reset modal state.
  const [resetTarget, setResetTarget] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetDone, setResetDone] = useState(false);
  const [copied, setCopied] = useState(false);

  // Quick View Modal State
  const [quickViewTarget, setQuickViewTarget] = useState<any | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  
  // Create user state
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ full_name: '', email: '', password: genTempPassword(), role: roleFilter || 'student' });
  const [createLoading, setCreateLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getUsers();
      if (data) {
        setUsers(data);
      }
    } catch (e) {
      console.error("Failed to fetch users", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to completely delete ${name}? This action cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(userId);
      showToast('User deleted successfully', 'success');
      fetchUsers();
    } catch (e) {
      showToast('Failed to delete user', 'error');
    }
  };

  const submitCreate = async () => {
    if (!createForm.full_name || !createForm.email || !createForm.password) {
      showToast('Please fill all fields', 'error');
      return;
    }
    setCreateLoading(true);
    try {
      await adminAPI.createUser(createForm);
      showToast('User created successfully', 'success');
      setShowCreate(false);
      setCreateForm({ full_name: '', email: '', password: genTempPassword(), role: roleFilter || 'student' });
      fetchUsers();
    } catch (e) {
      showToast('Failed to create user', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter && u.role !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const openReset = (user: any) => {
    setResetTarget(user);
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
      setResetError("This user has no email on file, so their password can't be reset here.");
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
        setResetError("The password couldn't be updated. Make sure this user has a valid account, then try again.");
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
      // fallback
    }
  };


  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]">
        <h3 className="font-bold">User Directory</h3>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-[var(--color-blue)]"
            />
          </div>
          <button 
            onClick={() => setShowCreate(true)}
            className="btn btn-primary text-sm whitespace-nowrap px-4 py-2 bg-[var(--color-blue)] text-white rounded-lg hover:opacity-90"
          >
            + New {roleFilter ? roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1) : 'User'}
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-[var(--muted)]">Loading directory...</div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-[var(--muted)] bg-[var(--surface-dark)] border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider">User Details</th>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider">Role</th>
              <th className="px-6 py-4 font-semibold text-xs tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-[var(--surface)] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => setQuickViewTarget(u)}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-[var(--border)] flex items-center justify-center text-[var(--primary)] font-bold shadow-inner">
                      {u.full_name ? u.full_name.charAt(0).toUpperCase() : <UserIcon size={18}/>}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">{u.full_name || 'Anonymous User'}</div>
                      <div className="text-xs text-[var(--muted)] flex items-center gap-1 mt-0.5"><Mail size={12}/> {u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${u.role === "admin" ? "bg-red-500/10 text-red-400 border-red-500/20" : u.role === "teacher" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                    {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setQuickViewTarget(u)} className="p-2 rounded-lg bg-[var(--surface-dark)] border border-[var(--border)] hover:bg-[var(--bg-main)] text-[var(--text-primary)] transition-all" title="View Details"><Eye size={16}/></button>
                    <button onClick={() => openReset(u)} className="p-2 rounded-lg bg-[var(--surface-dark)] border border-[var(--border)] hover:bg-yellow-500/10 hover:text-yellow-500 hover:border-yellow-500/20 text-[var(--text-primary)] transition-all" title="Reset Password"><Key size={16}/></button>
                    <button onClick={() => handleDelete(u.id, u.full_name)} className="p-2 rounded-lg bg-[var(--surface-dark)] border border-[var(--border)] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-[var(--text-primary)] transition-all" title="Delete User"><Ban size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr><td colSpan={3} className="p-12 text-center text-[var(--muted)]">No users found in this directory.</td></tr>
            )}
          </tbody>
        </table>
      )}

      {/* Quick View Modal */}
      {quickViewTarget && (
        <div
          onClick={() => setQuickViewTarget(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-default)] overflow-hidden shadow-2xl transform transition-all"
          >
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
              <button onClick={() => setQuickViewTarget(null)} className="absolute top-4 right-4 text-white/70 hover:text-white" title="Close"><X size={20} /></button>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-2xl font-bold shadow-inner">
                  {quickViewTarget.full_name ? quickViewTarget.full_name.charAt(0).toUpperCase() : <UserIcon size={24}/>}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{quickViewTarget.full_name || 'Anonymous User'}</h3>
                  <div className="text-sm text-blue-100 flex items-center gap-1 mt-1"><Mail size={14}/> {quickViewTarget.email}</div>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)]">
                  <div className="text-xs text-[var(--muted)] font-medium mb-1 uppercase tracking-wider">Role</div>
                  <div className="font-semibold capitalize text-[var(--text-primary)]">{quickViewTarget.role}</div>
                </div>
                <div className="bg-[var(--surface)] p-3 rounded-xl border border-[var(--border)]">
                  <div className="text-xs text-[var(--muted)] font-medium mb-1 uppercase tracking-wider">Status</div>
                  <div className="font-semibold text-green-500">Active</div>
                </div>
              </div>
              
              <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
                <h4 className="text-sm font-bold mb-2">Platform Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[var(--muted)]">User ID:</span> <span className="font-mono text-xs">{quickViewTarget.id.substring(0,8)}...</span></div>
                </div>
              </div>

              {quickViewTarget.role === 'student' && (
                <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)]">
                  <h4 className="text-sm font-bold mb-2">Enrolled Courses</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm p-2 bg-[var(--surface-dark)] rounded-lg border border-[var(--border)]">
                      <span className="font-medium text-[var(--text-primary)]">Python Masterclass</span>
                      <span className="text-[10px] uppercase tracking-wider bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">Active</span>
                    </div>
                    <div className="flex justify-between items-center text-sm p-2 bg-[var(--surface-dark)] rounded-lg border border-[var(--border)]">
                      <span className="font-medium text-[var(--text-primary)]">React Fundamentals</span>
                      <span className="text-[10px] uppercase tracking-wider bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">Completed</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-dark)] flex gap-2 justify-end">
              <button onClick={() => setQuickViewTarget(null)} className="px-4 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-main)]">Close</button>
            </div>
          </div>
        </div>
      )}

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
              {resetTarget.full_name || 'User'}<br />
              <span style={{ fontFamily: 'monospace' }}>{resetTarget.email || 'No email on file'}</span>
            </div>

            {resetDone ? (
              <>
                <div style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#34D399', padding: '12px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '16px' }}>
                  Password updated. Share the new password below with the user.
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

      {showCreate && (
        <div
          onClick={() => setShowCreate(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '420px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-lg)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>Create New User</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Full Name</label>
                <input
                  type="text"
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm({...createForm, full_name: e.target.value})}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[var(--color-blue)]"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Email</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[var(--color-blue)]"
                  placeholder="john@example.com"
                />
              </div>
              {!roleFilter && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Role</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({...createForm, role: e.target.value as any})}
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[var(--color-blue)]"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--muted)]">Temporary Password</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)', fontFamily: 'monospace' }}
                  />
                  <button onClick={() => setCreateForm({...createForm, password: genTempPassword()})} style={{ padding: '8px', border: '1px solid var(--border-default)', borderRadius: '8px', cursor: 'pointer', background: 'none' }}><RefreshCw size={16} /></button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
              <button onClick={() => setShowCreate(false)} className="btn" style={{ flex: 1, border: '1px solid var(--border-default)', background: 'none', color: 'var(--text-primary)' }}>Cancel</button>
              <button onClick={submitCreate} className="btn btn-primary bg-[var(--color-blue)] text-white" style={{ flex: 1 }} disabled={createLoading}>
                {createLoading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

