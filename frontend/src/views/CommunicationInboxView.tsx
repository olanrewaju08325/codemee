import React, { useState, useEffect } from 'react';
import { Bell, Megaphone, Inbox, Search, CheckCircle, ChevronLeft } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import apiClient from '../apiClient';
import ReactMarkdown from 'react-markdown';
import { useToast } from '../contexts/ToastContext';

interface CommunicationInboxViewProps {
  session: any;
}

export const CommunicationInboxView: React.FC<CommunicationInboxViewProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'announcements'>('notifications');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [notifData, annData] = await Promise.all([
          apiClient.auth.getNotifications(50).catch(() => []),
          apiClient.announcements.getAll().catch(() => [])
        ]);
        setNotifications(notifData);
        setAnnouncements(annData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session?.user?.id]);

  const handleMarkAsRead = async () => {
    try {
      await apiClient.auth.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      addToast('success', 'All notifications marked as read');
    } catch (e) {
      console.error('Failed to mark read', e);
      addToast('error', 'Failed to mark notifications as read');
    }
  };

  const filteredNotifications = notifications.filter(n => n.title?.toLowerCase().includes(search.toLowerCase()) || n.message?.toLowerCase().includes(search.toLowerCase()));
  const filteredAnnouncements = announcements.filter(a => a.title?.toLowerCase().includes(search.toLowerCase()) || a.body?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div style={{ display: 'flex', height: '100%', padding: '24px', gap: '24px' }}>
      <Skeleton height="100%" width="280px" borderRadius="12px" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Skeleton height={80} borderRadius="8px" />
        <Skeleton height={80} borderRadius="8px" />
        <Skeleton height={80} borderRadius="8px" />
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ height: '60px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', padding: '0 var(--space-4)', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}>
        <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronLeft size={20} /> Back
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Sidebar */}
        <div style={{ width: '280px', borderRight: '1px solid var(--border-default)', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Inbox size={20} /> Inbox
            </h2>
            
            <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search messages..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => setActiveTab('notifications')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: 'none', background: activeTab === 'notifications' ? 'rgba(41,214,232,0.1)' : 'transparent', color: activeTab === 'notifications' ? 'var(--color-cyan)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontWeight: 'var(--weight-bold)' }}
              >
                <Bell size={18} /> Notifications
              </button>
              <button 
                onClick={() => setActiveTab('announcements')}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: 'none', background: activeTab === 'announcements' ? 'rgba(139,47,166,0.1)' : 'transparent', color: activeTab === 'announcements' ? 'var(--color-purple)' : 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left', fontWeight: 'var(--weight-bold)' }}
              >
                <Megaphone size={18} /> Announcements
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            
            {activeTab === 'notifications' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                  <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)' }}>Notifications</h3>
                  <button onClick={handleMarkAsRead} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}>
                    <CheckCircle size={16} /> Mark all as read
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {filteredNotifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No notifications found.</div>
                  ) : (
                    filteredNotifications.map((n, i) => (
                      <div key={i} style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', borderLeft: n.is_read ? '1px solid var(--border-default)' : '4px solid var(--color-blue)' }}>
                        <h4 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)', marginBottom: '4px' }}>{n.title}</h4>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{n.message}</p>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                          {new Date(n.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'announcements' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                  <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)' }}>Official Announcements</h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {filteredAnnouncements.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No announcements found.</div>
                  ) : (
                    filteredAnnouncements.map((a, i) => (
                      <div key={i} style={{ padding: 'var(--space-6)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
                        <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: '12px' }}>{a.title}</h4>
                        <div className="markdown-body" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                          <ReactMarkdown>{a.body || a.content || ''}</ReactMarkdown>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>Posted on {new Date(a.created_at).toLocaleDateString()}</span>
                          <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>{a.priority || 'Standard'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};
