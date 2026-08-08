import React, { useState, useEffect } from 'react';
import { ChevronLeft, LifeBuoy, Plus, MessageSquare, Loader2, Send } from 'lucide-react';
import apiClient from '../apiClient';

interface SupportTicketViewProps {
  session: any;
}

export const SupportTicketView: React.FC<SupportTicketViewProps> = ({ session }) => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: '', category: 'technical', description: '', priority: 'medium' });

  useEffect(() => {
    fetchTickets();
  }, [session]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.support.getTickets();
      setTickets(data);
    } catch (err) {
      console.error('Failed to load tickets', err);
      setError('We could not load your support requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiClient.support.createTicket(newTicket);
      setIsCreating(false);
      setNewTicket({ title: '', category: 'technical', description: '', priority: 'medium' });
      await fetchTickets();
    } catch (err) {
      console.error('Error creating ticket', err);
      setError('Your request was not submitted. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && tickets.length === 0) return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" /></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ height: '60px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', padding: '0 var(--space-4)', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}>
        <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronLeft size={20} /> Back
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {error && <div role="alert" style={{ marginBottom: '16px', padding: '12px', borderRadius: 'var(--radius-md)', color: '#FCA5A5', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)' }}>{error}</div>}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <div>
              <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-bold)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <LifeBuoy size={28} style={{ color: 'var(--color-blue)' }} /> Help Desk
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>Get support for your academic journey.</p>
            </div>
            {!isCreating && (
              <button onClick={() => setIsCreating(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--color-blue)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <Plus size={16} /> New Ticket
              </button>
            )}
          </div>

          {isCreating ? (
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: 'var(--space-6)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-4)' }}>Create Support Ticket</h3>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: '8px' }}>Subject</label>
                  <input required value={newTicket.title} onChange={e => setNewTicket({...newTicket, title: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} placeholder="Briefly describe your issue..." />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: '8px' }}>Category</label>
                    <select value={newTicket.category} onChange={e => setNewTicket({...newTicket, category: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                      <option value="technical">Technical</option>
                      <option value="payment">Payment</option>
                      <option value="enrollment">Enrollment</option>
                      <option value="account">Account</option>
                      <option value="academic">Academic</option>
                      <option value="certificate">Certificates</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: '8px' }}>Priority</label>
                    <select value={newTicket.priority} onChange={e => setNewTicket({...newTicket, priority: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)', marginBottom: '8px' }}>Description</label>
                  <textarea required value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '120px', resize: 'vertical' }} placeholder="Provide as much detail as possible..." />
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button type="button" onClick={() => setIsCreating(false)} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid var(--border-default)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: 'var(--color-blue)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Submit Ticket
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {tickets.length === 0 ? (
                <div style={{ padding: 'var(--space-6)', textAlign: 'center', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-lg)', color: 'var(--text-secondary)' }}>
                  <LifeBuoy size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                  <p>You have no support tickets.</p>
                </div>
              ) : (
                tickets.map((t) => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: 'var(--space-4)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', backgroundColor: t.status === 'open' ? 'rgba(41,214,232,0.1)' : 'rgba(16,185,129,0.1)', color: t.status === 'open' ? 'var(--color-cyan)' : '#10B981', padding: '2px 8px', borderRadius: '999px' }}>
                          {t.status || 'open'}
                        </span>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', padding: '2px 8px', borderRadius: '999px' }}>
                          {t.category}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)', marginBottom: '4px' }}>{t.title}</h3>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '12px' }}>
                        Submitted: {new Date(t.created_at).toLocaleString()}
                      </div>
                    </div>
                    <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--color-blue)', cursor: 'pointer', fontSize: 'var(--text-sm)' }}>
                      <MessageSquare size={16} /> View
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
