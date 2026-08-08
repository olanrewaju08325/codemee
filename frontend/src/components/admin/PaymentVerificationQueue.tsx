import React, { useEffect, useState } from 'react';
import { CheckCircle, Eye, Loader2, XCircle } from 'lucide-react';
import apiClient from '../../apiClient';

export const PaymentVerificationQueue: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const load = async () => {
    setLoading(true); setError(null);
    try { setPayments(await apiClient.commerce.getPendingSubmissions()); }
    catch { setError('Unable to load the course-payment verification queue.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const approve = async (id: string) => { try { await apiClient.commerce.approveSubmission(id); await load(); } catch { setError('Approval failed. Confirm the bank transfer and try again.'); } };
  const reject = async (id: string) => {
    if (!reason.trim()) { setError('A rejection reason is required.'); return; }
    try { await apiClient.commerce.rejectSubmission(id, reason); setRejecting(null); setReason(''); await load(); }
    catch { setError('Rejection failed. Please try again.'); }
  };
  const viewReceipt = async (id: string) => {
    try { const { url } = await apiClient.commerce.getReceiptUrl(id); window.open(url, '_blank', 'noopener,noreferrer'); }
    catch { setError('The private receipt link could not be generated.'); }
  };
  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
  return <section className="card" style={{ padding: '24px' }}>
    <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Course Payment Verification</h2>
    <p style={{ color: 'var(--text-secondary)', margin: '6px 0 18px' }}>Approve only after confirming the transfer reference and amount in the provider account.</p>
    {error && <p role="alert" style={{ color: '#F87171', marginBottom: '12px' }}>{error}</p>}
    {payments.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No course payments are awaiting review.</p> : <div style={{ display: 'grid', gap: '12px' }}>
      {payments.map(payment => <div key={payment.id} style={{ border: '1px solid var(--border-default)', borderRadius: '10px', padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div><strong>₦{Number(payment.amount_claimed).toLocaleString()}</strong><div style={{ fontSize: '.8rem', color: 'var(--text-secondary)' }}>Reference: {payment.transfer_reference} · {payment.payer_name}</div></div>
          <div style={{ display: 'flex', gap: '8px' }}><button className="btn btn-secondary" onClick={() => viewReceipt(payment.id)}><Eye size={15} /> Receipt</button><button className="btn btn-primary" onClick={() => approve(payment.id)}><CheckCircle size={15} /> Approve</button><button className="btn btn-secondary" onClick={() => setRejecting(payment.id)}><XCircle size={15} /> Reject</button></div>
        </div>
        {rejecting === payment.id && <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}><input className="input-field" value={reason} onChange={e => setReason(e.target.value)} placeholder="Why is this payment being rejected?" /><button className="btn btn-primary" onClick={() => reject(payment.id)}>Confirm rejection</button></div>}
      </div>)}
    </div>}
  </section>;
};
