import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Loader2, Save, Key, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
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

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Account Settings
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">Manage your profile and preferences.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Avatar & Quick Info */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div style={{
              background: 'rgba(12, 74, 140, 0.05)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              <div className="relative mb-4 group">
                <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-4xl font-bold shadow-lg overflow-hidden border-4 border-[var(--bg-main)]">
                  {profile?.full_name?.charAt(0) || <User size={48} />}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-[var(--primary)] text-white rounded-full shadow-md hover:scale-110 transition-transform cursor-not-allowed opacity-80" title="Avatar upload coming soon">
                  <Camera size={16} />
                </button>
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{profile?.full_name}</h2>
              <div className="flex items-center gap-2 justify-center text-[var(--primary)] mt-2 bg-[var(--primary)] bg-opacity-10 px-3 py-1 rounded-full text-sm font-medium">
                <Shield size={14} />
                <span className="capitalize">{profile?.role} Account</span>
              </div>
              
              <div className="w-full mt-6 pt-6 border-t border-[var(--border-color)] text-left space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)]">Member Since</span>
                  <span className="font-medium text-[var(--text-primary)]">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '2023'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)]">Student ID</span>
                  <span className="font-medium text-[var(--text-primary)]">{profile?.student_id || 'N/A'}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Edit Form */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div style={{
              background: 'var(--surface-color)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-8)'
            }}>
              <h3 className="text-xl font-bold mb-6 text-[var(--text-primary)] flex items-center gap-2">
                <User size={20} className="text-[var(--primary)]" />
                Personal Information
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 text-sm">
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20 text-sm">
                    Profile updated successfully!
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all text-[var(--text-primary)]"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 text-[var(--text-secondary)] opacity-50" size={18} />
                      <input
                        type="email"
                        disabled
                        className="w-full pl-12 pr-4 py-3 bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] opacity-60 cursor-not-allowed"
                        value={profile?.email || 'Not available'}
                      />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-2">Contact support to change your registered email address.</p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[var(--border-color)] flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Security Section */}
            <div style={{
              background: 'var(--surface-color)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-8)',
              marginTop: 'var(--space-6)'
            }}>
              <h3 className="text-xl font-bold mb-4 text-[var(--text-primary)] flex items-center gap-2">
                <Key size={20} className="text-[var(--primary)]" />
                Security
              </h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6">Manage your password and account security settings.</p>
              
              <button 
                className="px-4 py-2 border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-main)] transition-colors text-sm font-medium"
                onClick={() => alert('Password reset link has been sent to your email.')}
              >
                Send Password Reset Email
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
