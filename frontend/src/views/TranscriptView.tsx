import React, { useState, useEffect } from 'react';
import { ChevronLeft, Printer, Loader2, ShieldCheck } from 'lucide-react';
import apiClient from '../apiClient';

interface TranscriptViewProps {
  session: any;
}

export const TranscriptView: React.FC<TranscriptViewProps> = ({ session }) => {
  const [profile, setProfile] = useState<any>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profData, certsData] = await Promise.all([
          apiClient.auth.getProfile(),
          apiClient.certificates.getUserCertificates()
        ]);
        setProfile(profData);
        setCertificates(certsData);
      } catch (err) {
        console.error('Error fetching transcript data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [session]);

  if (loading) {
    return <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" /></div>;
  }

  // Print friendly styles are injected directly or via class
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
      
      {/* Non-printable Header */}
      <div className="no-print" style={{ height: '60px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 var(--space-4)', backgroundColor: 'var(--bg-secondary)', flexShrink: 0 }}>
        <button onClick={() => window.history.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronLeft size={20} /> Back
        </button>
        <button onClick={() => window.print()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--color-blue)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-8)' }} className="print-container">
        {/* Printable Transcript Area */}
        <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', color: 'black', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', minHeight: '1100px' }} className="print-canvas">
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#0C4A8C' }}>CODEME ACADEMY</h1>
              <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#555' }}>Official Academic Transcript</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>Issued: {new Date().toLocaleDateString()}</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#555' }}>Verification ID: TR-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
            </div>
          </div>

          {/* Student Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#777', textTransform: 'uppercase' }}>Student Name</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{profile?.full_name}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#777', textTransform: 'uppercase' }}>Student ID</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{profile?.student_id || 'N/A'}</p>
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#777', textTransform: 'uppercase' }}>Enrollment Date</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>2026</p>
            </div>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#777', textTransform: 'uppercase' }}>Academic Standing</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#10B981' }}>Good Standing</p>
            </div>
          </div>

          {/* Academic Record Table */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '16px', textTransform: 'uppercase' }}>Course Record</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Course Code</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Course Title</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Credits</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Grade</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {certificates.length > 0 ? (
                  certificates.map((cert) => (
                    <tr key={cert.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{cert.course_id.toUpperCase()}</td>
                      <td style={{ padding: '12px' }}>
                        {cert.course_id === 'wd101' ? 'Web Development — HTML Fundamentals' : `Course: ${cert.course_id}`}
                      </td>
                      <td style={{ padding: '12px' }}>3.0</td>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>A</td>
                      <td style={{ padding: '12px', color: '#10B981' }}>Completed</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#777' }}>
                      No completed courses on record yet.
                    </td>
                  </tr>
                )}
                {/* Mock In-Progress Course */}
                <tr style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>WD102</td>
                  <td style={{ padding: '12px' }}>CSS Architecture</td>
                  <td style={{ padding: '12px' }}>3.0</td>
                  <td style={{ padding: '12px' }}>--</td>
                  <td style={{ padding: '12px', color: '#F59E0B' }}>In Progress</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* GPA Summary */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '60px' }}>
            <div style={{ width: '300px', backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '4px', border: '1px solid #eee' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#555' }}>Total Credits Earned:</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{certificates.length * 3.0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: '#555' }}>Cumulative GPA:</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{certificates.length > 0 ? '4.0' : 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '40px' }}>
            <div style={{ textAlign: 'center', width: '200px' }}>
              <div style={{ borderBottom: '1px solid #000', height: '40px', marginBottom: '8px' }}>
                {/* Simulated signature image could go here */}
              </div>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold' }}>Registrar</p>
              <p style={{ margin: 0, fontSize: '10px', color: '#777' }}>CodeMe Academy</p>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <ShieldCheck size={48} style={{ color: '#0C4A8C', opacity: 0.2, marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '10px', color: '#777', maxWidth: '250px' }}>
                This is an official document. Any alteration or erasure renders it void. Verify authenticity at codeme.edu/verify
              </p>
            </div>
          </div>

        </div>
      </div>
      
      {/* Global Print CSS to strip dark mode and hide buttons when actually printing */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print-canvas, .print-canvas * {
            visibility: visible;
          }
          .print-canvas {
            position: absolute;
            left: 0;
            top: 0;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
};
