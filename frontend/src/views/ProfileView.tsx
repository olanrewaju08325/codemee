import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Loader2, Save, Key, Camera, Award, BookOpen, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import apiClient from '../apiClient';

export const ProfileView = () => {
  const { profile, refreshProfile } = useAuth();
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
      await refreshProfile();
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: 'var(--space-6)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-8)'
    }}>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <h1 style={{ 
            fontSize: 'var(--text-4xl)', 
            fontWeight: 'var(--weight-extrabold)', 
            fontFamily: 'var(--font-headings)',
            background: 'linear-gradient(90deg, var(--color-primary-500) 0%, var(--color-secondary-500) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 'var(--space-2)'
          }}>
            Account Settings
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>Manage your profile and preferences to personalize your CodeMe experience.</p>
        </div>
        
        <div className="responsive-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-8)'
        }}>
          {/* Left Column: Avatar & Quick Info */}
          <motion.div variants={itemVariants} style={{ flex: '1', minWidth: '320px', maxWidth: '400px' }}>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Background Decoration */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                left: '-50px',
                width: '150px',
                height: '150px',
                background: 'var(--color-primary-500)',
                filter: 'blur(80px)',
                opacity: 0.1,
                zIndex: 0
              }} />

              <div style={{ position: 'relative', marginBottom: 'var(--space-6)', zIndex: 1 }}>
                <div style={{
                  width: '120px',
                  height: '120px',
                  background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-secondary-500))',
                  color: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'var(--text-5xl)',
                  fontWeight: 'var(--weight-bold)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '4px solid var(--bg-main)',
                }}>
                  {profile?.full_name?.charAt(0)?.toUpperCase() || <User size={48} />}
                </div>
                <button 
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    padding: 'var(--space-3)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '50%',
                    boxShadow: 'var(--shadow-md)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  title="Avatar upload coming soon"
                >
                  <Camera size={18} />
                </button>
              </div>
              <h2 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', color: 'var(--text-primary)', zIndex: 1, fontFamily: 'var(--font-headings)' }}>
                {profile?.full_name || 'CodeMe Student'}
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                color: 'var(--color-primary-500)',
                background: 'rgba(12, 74, 140, 0.1)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-semibold)',
                marginTop: 'var(--space-3)',
                zIndex: 1
              }}>
                <Shield size={16} />
                <span style={{ textTransform: 'capitalize' }}>{profile?.role || 'student'} Account</span>
              </div>
              
              <div style={{
                width: '100%',
                marginTop: 'var(--space-8)',
                paddingTop: 'var(--space-6)',
                borderTop: '1px solid var(--border-color)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                zIndex: 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Clock size={16} /> Member Since
                  </span>
                  <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'New Member'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <Award size={16} /> Student ID
                  </span>
                  <span style={{ fontWeight: 'var(--weight-semibold)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
                    {profile?.student_id || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Edit Form */}
          <motion.div variants={itemVariants} style={{ flex: '2', minWidth: '320px' }}>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-8)',
              boxShadow: 'var(--shadow-md)',
              marginBottom: 'var(--space-6)'
            }}>
              <h3 style={{ 
                fontSize: 'var(--text-xl)', 
                fontWeight: 'var(--weight-bold)', 
                color: 'var(--text-primary)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-8)',
                fontFamily: 'var(--font-headings)'
              }}>
                <User size={24} style={{ color: 'var(--color-primary-500)' }} />
                Personal Information
              </h3>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{
                    padding: 'var(--space-4)', background: 'var(--color-danger-bg)', color: 'var(--color-danger-text)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: 'var(--text-sm)'
                  }}>
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{
                    padding: 'var(--space-4)', background: 'var(--color-success-bg)', color: 'var(--color-success-text)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: 'var(--text-sm)'
                  }}>
                    Profile updated successfully!
                  </motion.div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                      Full Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        style={{
                          width: '100%',
                          padding: 'var(--space-4) var(--space-4)',
                          background: 'var(--bg-main)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-lg)',
                          fontSize: 'var(--text-base)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          fontFamily: 'inherit'
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-500)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(12, 74, 140, 0.1)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.boxShadow = 'none'; }}
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                      Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail style={{ position: 'absolute', left: 'var(--space-4)', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', opacity: 0.5 }} size={20} />
                      <input
                        type="email"
                        disabled
                        style={{
                          width: '100%',
                          padding: 'var(--space-4) var(--space-4) var(--space-4) 45px',
                          background: 'var(--bg-main)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-lg)',
                          fontSize: 'var(--text-base)',
                          color: 'var(--text-secondary)',
                          opacity: 0.7,
                          cursor: 'not-allowed',
                          fontFamily: 'inherit'
                        }}
                        value={profile?.email || 'Not available'}
                      />
                    </div>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>Contact support to change your registered email address.</p>
                  </div>
                </div>

                <div style={{ paddingTop: 'var(--space-6)', marginTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      padding: 'var(--space-3) var(--space-6)',
                      background: 'linear-gradient(90deg, var(--color-primary-500) 0%, var(--color-secondary-500) 100%)',
                      color: 'white',
                      fontWeight: 'var(--weight-medium)',
                      fontSize: 'var(--text-base)',
                      border: 'none',
                      borderRadius: 'var(--radius-lg)',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      transition: 'all 0.2s ease',
                      boxShadow: 'var(--shadow-md)',
                      fontFamily: 'inherit'
                    }}
                    onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseOut={(e) => !loading && (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {loading ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Security Section */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-2xl)',
              padding: 'var(--space-8)',
              boxShadow: 'var(--shadow-md)'
            }}>
              <h3 style={{ 
                fontSize: 'var(--text-xl)', 
                fontWeight: 'var(--weight-bold)', 
                color: 'var(--text-primary)', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-2)',
                fontFamily: 'var(--font-headings)'
              }}>
                <Key size={24} style={{ color: 'var(--color-primary-500)' }} />
                Security
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)' }}>Manage your password and account security settings.</p>
              
              <button 
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  borderRadius: 'var(--radius-lg)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-medium)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary-500)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
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

