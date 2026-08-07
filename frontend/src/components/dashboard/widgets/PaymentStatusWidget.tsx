import { motion } from 'framer-motion';
import { CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { EmptyState } from '../../ui/EmptyState';

interface PaymentStatusWidgetProps {
  payments: any[];
  onUploadReceipt: () => void;
}

export const PaymentStatusWidget = ({ payments, onUploadReceipt }: PaymentStatusWidgetProps) => {
  const latestPayment = payments?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      style={{ height: '100%' }}
    >
      <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', fontFamily: 'var(--font-headings)' }}>
            Payment Status
          </h3>
        </div>

        {!latestPayment ? (
          <EmptyState 
            title="No payments found"
            description="Upload your payment receipt if you have paid for a certificate or retake."
            icon={<CreditCard size={32} />}
            actionLabel="Upload Receipt"
            onAction={onUploadReceipt}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', backgroundColor: latestPayment.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : latestPayment.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
              {latestPayment.status === 'approved' && <CheckCircle2 size={24} color="#10B981" />}
              {latestPayment.status === 'pending' && <AlertCircle size={24} color="#F59E0B" />}
              {latestPayment.status === 'rejected' && <AlertCircle size={24} color="#EF4444" />}
              
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', textTransform: 'capitalize' }}>
                  {latestPayment.status} Verification
                </h4>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  {latestPayment.status === 'pending' ? 'Your receipt is being reviewed.' : latestPayment.status === 'approved' ? 'Payment verified successfully.' : latestPayment.rejection_reason || 'Payment rejected. Action required.'}
                </p>
              </div>
            </div>

            {latestPayment.status !== 'approved' && (
              <Button variant="outline" fullWidth onClick={onUploadReceipt}>
                {latestPayment.status === 'rejected' ? 'Upload New Receipt' : 'View Details'}
              </Button>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
};
