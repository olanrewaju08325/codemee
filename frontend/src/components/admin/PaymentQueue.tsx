import React from 'react'
import { Eye, Loader2 } from 'lucide-react'

interface PaymentQueueProps {
  paymentsQueue: any[];
  actionLoading: boolean;
  handleApprovePayment: (id: string) => void;
  handleRejectPayment: () => void;
  showRejectModal: string | null;
  setShowRejectModal: (id: string | null) => void;
  rejectReason: string;
  setRejectReason: (reason: string) => void;
  selectedReceipt: string | null;
  setSelectedReceipt: (url: string | null) => void;
}

const PaymentQueue: React.FC<PaymentQueueProps> = ({
  paymentsQueue,
  actionLoading,
  handleApprovePayment,
  handleRejectPayment,
  showRejectModal,
  setShowRejectModal,
  rejectReason,
  setRejectReason,
  selectedReceipt,
  setSelectedReceipt
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ fontFamily: 'var(--font-headings)', fontSize: '1.25rem', fontWeight: 800 }}>Pending Payment verifications</h3>
      {paymentsQueue.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No pending bank payments in queue.</div>
      ) : (
        paymentsQueue.map(p => (
          <div key={p.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{p.profiles?.full_name || 'Anonymous'}</h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ID: {p.profiles?.student_id || 'N/A'}</span>
              </div>
              <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>₦{p.amount}</span>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Target Exam: {p.quizzes?.title}</p>
            
            {/* Image render */}
            <div style={{ textAlign: 'center' }}>
              <button 
                onClick={() => setSelectedReceipt(p.signedUrl)}
                className="btn btn-secondary"
                style={{ padding: '8px', fontSize: '0.75rem', gap: '6px' }}
                disabled={!p.signedUrl}
              >
                <Eye size={14} /> View Receipt Screen
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button 
                className="btn" 
                onClick={() => handleApprovePayment(p.id)}
                disabled={actionLoading}
                style={{ backgroundColor: 'var(--color-success)', color: '#FFFFFF', padding: '8px 12px', fontSize: '0.8rem', flex: 1, cursor: 'pointer' }}
              >
                {actionLoading ? <Loader2 className="animate-spin" size={14} /> : 'Approve Transfer'}
              </button>
              <button 
                className="btn" 
                onClick={() => setShowRejectModal(p.id)}
                disabled={actionLoading}
                style={{ backgroundColor: 'var(--color-danger)', color: '#FFFFFF', padding: '8px 12px', fontSize: '0.8rem', flex: 1, cursor: 'pointer' }}
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}

      {/* Reject Modal inline */}
      {showRejectModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '320px', backgroundColor: 'var(--bg-secondary)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Enter Rejection Reason</h4>
            <textarea 
              className="input-field" 
              placeholder="e.g. Blurry image, wrong amount..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              style={{ minHeight: '80px', fontSize: '0.85rem' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={handleRejectPayment}
                className="btn"
                style={{ backgroundColor: 'var(--color-danger)', color: '#FFFFFF', padding: '8px' }}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="animate-spin" size={14} /> : 'Submit Reject'}
              </button>
              <button 
                onClick={() => { setShowRejectModal(null); setRejectReason(''); }}
                className="btn btn-secondary"
                style={{ padding: '8px' }}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal Overlay */}
      {selectedReceipt && (
        <div 
          onClick={() => setSelectedReceipt(null)}
          style={{ 
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
            backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}
        >
          <img 
            src={selectedReceipt} 
            alt="Payment Receipt" 
            style={{ maxWidth: '100%', maxHeight: '80%', borderRadius: '8px', objectFit: 'contain' }}
          />
        </div>
      )}
    </div>
  )
}

export default PaymentQueue
