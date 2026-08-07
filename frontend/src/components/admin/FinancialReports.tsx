import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Download, Eye } from 'lucide-react';
import apiClient from '../../apiClient';

export const FinancialReports: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchPayments();
  }, [filter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // In a real scenario, API would support filtering. For now we use getPendingPayments
      const data = await apiClient.admin.getPendingPayments().catch(() => []);
      setPayments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await apiClient.admin.updatePayment(id, { status: 'verified' });
      fetchPayments();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await apiClient.admin.updatePayment(id, { status: 'rejected', rejection_reason: 'Invalid receipt' });
      fetchPayments();
    } catch (e) {
      console.error(e);
    }
  };

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,ID,Amount,Status,Date\n" + payments.map(p => `${p.id},${p.amount || 0},${p.status},${p.created_at}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "financial_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>Financial & Payments</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Manage manual payment verifications and export revenue reports.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <option value="pending">Pending Verification</option>
            <option value="verified">Verified Receipts</option>
            <option value="rejected">Rejected</option>
          </select>
          <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Pending Amount</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--color-yellow)' }}>₦145,000</div>
        </div>
        <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Verified Revenue</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: '#10B981' }}>₦2,450,000</div>
        </div>
        <div style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Rejected Payments</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'bold', color: 'var(--color-red)' }}>12</div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <tr>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-default)' }}>Reference</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-default)' }}>Student / Course</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-default)' }}>Date</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-default)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center' }}><Loader2 className="animate-spin mx-auto" /></td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No {filter} payments found.</td></tr>
            ) : (
              payments.map(payment => (
                <tr key={payment.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 'bold' }}>{payment.id.split('-')[0].toUpperCase()}</div>
                    <div style={{ fontSize: '10px', color: 'var(--color-yellow)', textTransform: 'uppercase', marginTop: '4px' }}>Pending</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontSize: '14px' }}>Student Profile ID: {payment.student_id?.substring(0, 8)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Course: WD101</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>{new Date(payment.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={() => window.open(payment.receipt_file_path, '_blank')} style={{ padding: '6px', background: 'none', border: '1px solid var(--border-default)', borderRadius: '4px', cursor: 'pointer', color: 'var(--color-blue)' }} title="View Receipt"><Eye size={14} /></button>
                      <button onClick={() => handleApprove(payment.id)} style={{ padding: '6px', background: 'none', border: '1px solid var(--border-default)', borderRadius: '4px', cursor: 'pointer', color: '#10B981' }} title="Approve"><CheckCircle size={14} /></button>
                      <button onClick={() => handleReject(payment.id)} style={{ padding: '6px', background: 'none', border: '1px solid var(--border-default)', borderRadius: '4px', cursor: 'pointer', color: 'var(--color-red)' }} title="Reject"><XCircle size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
