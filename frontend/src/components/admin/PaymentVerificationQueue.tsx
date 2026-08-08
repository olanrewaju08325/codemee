import { useState, useEffect } from "react";
import { Check, X, FileText } from "lucide-react";
import apiClient from "../../apiClient";

export const PaymentVerificationQueue = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await apiClient.admin.getPendingPayments();
        if (data) setPayments(data);
      } catch (e) {
        console.error("Failed to fetch pending payments", e);
      }
      setLoading(false);
    };
    fetchPayments();
  }, []);

  return (
    <div className="bg-[var(--surface-dark)] border border-[var(--border)] rounded-xl overflow-hidden">
      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface)]">
        <h3 className="font-bold">Pending Manual Payments</h3>
      </div>
      
      {loading ? (
        <div className="p-8 text-center text-[var(--muted)]">Loading queue...</div>
      ) : payments.length === 0 ? (
        <div className="p-8 text-center text-[var(--muted)]">No pending payments require verification.</div>
      ) : (
        <table className="w-full text-sm text-left">
          <thead className="text-[var(--muted)] bg-[var(--surface)] uppercase border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-3">Reference ID</th>
              <th className="px-6 py-3">Method</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3 text-right">Verification</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--surface)]">
                <td className="px-6 py-4 font-medium flex items-center gap-2"><FileText size={16}/> {p.reference_id}</td>
                <td className="px-6 py-4 text-[var(--muted)]">{p.method}</td>
                <td className="px-6 py-4 font-bold text-green-400">{p.amount} {p.currency}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button className="bg-green-500/10 text-green-400 hover:bg-green-500/20 px-3 py-1 rounded flex items-center gap-1 transition-colors">
                    <Check size={14} /> Approve
                  </button>
                  <button className="bg-red-500/10 text-red-400 hover:bg-red-500/20 px-3 py-1 rounded flex items-center gap-1 transition-colors">
                    <X size={14} /> Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

