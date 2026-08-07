import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/EmptyState';

interface CertificatesWidgetProps {
  certificates: any[];
  onViewCertificates: () => void;
}

export const CertificatesWidget = ({ certificates, onViewCertificates }: CertificatesWidgetProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      style={{ height: '100%' }}
    >
      <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)', fontFamily: 'var(--font-headings)' }}>
            Certificates
          </h3>
          <button onClick={onViewCertificates} style={{ background: 'none', border: 'none', color: 'var(--color-blue)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', cursor: 'pointer' }}>
            View all
          </button>
        </div>

        {certificates.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState 
              title="No certificates yet"
              description="Complete a course to earn your first certificate."
              icon={<Award size={32} />}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {certificates.map((cert) => (
              <div key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)' }}>
                <div style={{ color: 'var(--color-blue)' }}>
                  <Award size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cert.course?.title || 'Course Certificate'}</h4>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Issued: {new Date(cert.issued_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
};
