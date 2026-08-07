import React, { useState, useEffect } from 'react';
import { Server, Database, HardDrive, ShieldCheck, Activity, AlertTriangle, Loader2 } from 'lucide-react';

export const SystemHealth: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics] = useState({
    backend: 'Operational',
    database: 'Connected (12ms)',
    storage: '3.2 GB / 50 GB',
    aiService: 'Online',
    emails: 'Operational',
    notifications: 'Operational',
    version: 'v1.4.2-prod',
    environment: 'Production'
  });

  useEffect(() => {
    // In a real scenario, fetch from /api/admin/health
    const fetchHealth = async () => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 800)); // simulate network
      setLoading(false);
    };
    fetchHealth();
  }, []);

  const getStatusColor = (status: string) => {
    if (status.includes('Operational') || status.includes('Connected') || status.includes('Online')) return '#10B981';
    if (status.includes('Degraded')) return 'var(--color-yellow)';
    return 'var(--color-red)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>System Health</h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Monitor operational status of all microservices and infrastructure.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Backend Status */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(41,214,232,0.1)', color: 'var(--color-cyan)', borderRadius: '12px' }}>
            <Server size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Backend API</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: loading ? 'transparent' : getStatusColor(metrics.backend) }}>
              {loading ? <Loader2 size={16} className="animate-spin text-gray-500" /> : metrics.backend}
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981', borderRadius: '12px' }}>
            <Database size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>PostgreSQL Database</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: loading ? 'transparent' : getStatusColor(metrics.database) }}>
              {loading ? <Loader2 size={16} className="animate-spin text-gray-500" /> : metrics.database}
            </div>
          </div>
        </div>

        {/* Storage */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(139,47,166,0.1)', color: 'var(--color-purple)', borderRadius: '12px' }}>
            <HardDrive size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>Storage Usage</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>
              {loading ? <Loader2 size={16} className="animate-spin text-gray-500" /> : metrics.storage}
            </div>
          </div>
        </div>

        {/* AI Service */}
        <div style={{ padding: '24px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ padding: '12px', backgroundColor: 'rgba(239,68,68,0.1)', color: 'var(--color-red)', borderRadius: '12px' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: '4px' }}>AI Tutor Pipeline</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: loading ? 'transparent' : getStatusColor(metrics.aiService) }}>
              {loading ? <Loader2 size={16} className="animate-spin text-gray-500" /> : metrics.aiService}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '16px' }}>
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', padding: '24px' }}>
          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} color="var(--color-blue)" /> Deployment Info
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Environment</span> <span style={{ fontWeight: 'bold' }}>{metrics.environment}</span></li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Version</span> <span>{metrics.version}</span></li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>Region</span> <span>af-south-1</span></li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-secondary)' }}>SSL Certificate</span> <span style={{ color: '#10B981' }}>Valid</span></li>
          </ul>
        </div>
        
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', padding: '24px' }}>
          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={18} color="var(--color-yellow)" /> Recent Alerts
          </h3>
          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: '32px 0' }}>
            No recent operational alerts detected.
          </div>
        </div>
      </div>
    </div>
  );
};
