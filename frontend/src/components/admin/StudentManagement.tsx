import React, { useState, useEffect } from 'react';
import { Search, Loader2, UserX, Key } from 'lucide-react';
import apiClient from '../../apiClient';

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await apiClient.admin.getStudents(search).catch(() => []);
      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>Student Management</h2>
        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search students..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '8px 12px 8px 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
        </form>
      </div>

      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
            <tr>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-default)' }}>Student</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-default)' }}>ID</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-default)' }}>Role</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-default)' }}>Status</th>
              <th style={{ padding: '16px', borderBottom: '1px solid var(--border-default)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center' }}><Loader2 className="animate-spin mx-auto" /></td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No students found.</td></tr>
            ) : (
              students.map(student => (
                <tr key={student.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 'bold' }}>{student.full_name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{student.email || 'No email'}</div>
                  </td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>{student.student_id || 'N/A'}</td>
                  <td style={{ padding: '16px', fontSize: '14px' }}>{student.role || 'student'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981' }}>Active</span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button style={{ padding: '6px', background: 'none', border: '1px solid var(--border-default)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)' }} title="Reset Password"><Key size={14} /></button>
                      <button style={{ padding: '6px', background: 'none', border: '1px solid var(--border-default)', borderRadius: '4px', cursor: 'pointer', color: 'var(--color-red)' }} title="Suspend Account"><UserX size={14} /></button>
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
