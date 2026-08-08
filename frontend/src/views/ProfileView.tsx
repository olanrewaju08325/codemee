import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Loader2, Save } from 'lucide-react';
import { Card } from '../components/ui/Card';
import apiClient from '../apiClient';

export const ProfileView = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      await apiClient.auth.updateProfile({ full_name: formData.full_name });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[var(--border)]">
            <div className="w-20 h-20 bg-[var(--primary)] text-white rounded-full flex items-center justify-center text-3xl font-bold">
              {profile?.full_name?.charAt(0) || <User size={40} />}
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile?.full_name}</h2>
              <div className="flex items-center gap-2 text-[var(--muted)] mt-1">
                <Shield size={14} />
                <span className="capitalize">{profile?.role} Account</span>
              </div>
            </div>
          </div>

          {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20">{error}</div>}
          {success && <div className="p-4 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20">Profile updated successfully!</div>}

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-[var(--muted)]" size={18} />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 bg-[var(--surface-dark)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] text-[var(--text-primary)]"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--muted)] mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-[var(--muted)]" size={18} />
              <input
                type="email"
                disabled
                className="w-full pl-10 pr-4 py-2 bg-[var(--surface-dark)] border border-[var(--border)] rounded-lg text-[var(--muted)] opacity-70 cursor-not-allowed"
                value={profile?.email || 'Not available'}
              />
            </div>
            <p className="text-xs text-[var(--muted)] mt-1">Contact support to change your email address.</p>
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};
