import React, { useState, useEffect } from 'react';
import { ChevronLeft, Award, FileText, ShieldCheck, Star, Calendar } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import apiClient from '../apiClient';
import { Button } from '../components/ui/Button';

interface AcademicRecordViewProps {
  session: any;
  onNavigate: (view: string) => void;
}

export const AcademicRecordView: React.FC<AcademicRecordViewProps> = ({ session, onNavigate }) => {
  const [profile, setProfile] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profData, certsData, achData] = await Promise.all([
          apiClient.auth.getProfile(),
          apiClient.certificates.getUserCertificates(),
          apiClient.courses.getUserAchievements().catch(() => []) // Gracefully fail if gamification isn't fully set up
        ]);
        setProfile(profData);
        setCertificates(certsData);
        setAchievements(achData);
      } catch (err) {
        console.error('Error fetching academic record:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session?.user?.id]);

  if (loading) return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Skeleton height={150} borderRadius="12px" />
      <Skeleton height={300} borderRadius="12px" />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{ height: '60px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', padding: '0 var(--space-4)', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}>
        <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronLeft size={20} /> Back to Dashboard
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-6)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          
          {/* Profile Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-default)', paddingBottom: 'var(--space-6)' }}>
            <div>
              <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-bold)', marginBottom: '8px' }}>Academic Record</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Official learning history and achievements for <strong style={{ color: 'var(--text-primary)' }}>{profile?.full_name}</strong></p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={16} /> Student ID: {profile?.student_id || 'N/A'}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={16} /> Enrolled: 2026</span>
              </div>
            </div>
            <Button onClick={() => onNavigate('transcript')} style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}>
              <FileText size={18} /> View Official Transcript
            </Button>
          </div>

          {/* Certificates Section */}
          <div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={24} style={{ color: 'var(--color-yellow)' }} /> Certificates
            </h2>
            {certificates.length === 0 ? (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-lg)', color: 'var(--text-secondary)' }}>
                <Award size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                <p>No certificates earned yet. Keep learning!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                {certificates.map(cert => (
                  <div key={cert.id} style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(41,214,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-cyan)' }}>
                        <ShieldCheck size={20} />
                      </div>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981', padding: '2px 8px', borderRadius: '999px' }}>
                        Verified
                      </span>
                    </div>
                    <div>
                      <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--weight-bold)' }}>{cert.course_id === 'wd101' ? 'Web Development — HTML Fundamentals' : `Course ID: ${cert.course_id}`}</h3>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: '4px' }}>Issued on: {new Date(cert.issued_at).toLocaleDateString()}</p>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                      <Button onClick={() => onNavigate(`certificate/${cert.course_id}`)} style={{ flex: 1, backgroundColor: 'var(--color-blue)', color: 'white', fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
                        View
                      </Button>
                      <Button onClick={() => window.open(`/#/verify-certificate?id=${cert.certificate_code}`, '_blank')} style={{ flex: 1, backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
                        Verify
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements Section */}
          <div>
            <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-bold)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Star size={24} style={{ color: 'var(--color-purple)' }} /> Badges & Achievements
            </h2>
            {achievements.length === 0 ? (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-lg)', color: 'var(--text-secondary)' }}>
                <Star size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                <p>No achievements unlocked yet. Complete courses and quizzes to earn badges!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                {achievements.map((ach, idx) => (
                  <div key={idx} style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(139,47,166,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-purple)' }}>
                      <Star size={24} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-bold)' }}>{ach.badge_name || 'Achievement'}</h4>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Unlocked</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
