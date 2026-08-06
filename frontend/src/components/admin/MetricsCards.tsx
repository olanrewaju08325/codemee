import React from 'react'

interface MetricsProps {
  metrics: {
    totalStudents: number;
    activeEnrollments: number;
    pendingPayments: number;
    pendingGrading: number;
  }
}

const MetricsCards: React.FC<MetricsProps> = ({ metrics }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
      <div className="card">
        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL STUDENTS</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '4px' }}>{metrics.totalStudents}</h1>
      </div>
      <div className="card">
        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ACTIVE ENROLLMENTS</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-blue)', marginTop: '4px' }}>{metrics.activeEnrollments}</h1>
      </div>
      <div className="card">
        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>UNGRADED PROJECTS</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-purple)', marginTop: '4px' }}>{metrics.pendingGrading}</h1>
      </div>
      <div className="card">
        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PENDING RETAKES</span>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-cyan)', marginTop: '4px' }}>{metrics.pendingPayments}</h1>
      </div>
    </div>
  )
}

export default MetricsCards
