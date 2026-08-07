import React, { useState } from 'react';
import { Save, Loader2, AlertCircle } from 'lucide-react';
import apiClient from '../../apiClient';

export const PlatformSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    academyName: 'CodeMe Academy',
    supportEmail: 'support@codeme.edu.ng',
    maintenanceMode: false,
    registrationOpen: true
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await apiClient.admin.updateSystemSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 'bold' }}>Platform Settings</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Manage global academy configurations.</p>
        </div>
        <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'var(--color-blue)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
        </button>
      </div>

      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10B981', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16,185,129,0.2)' }}>
          <AlertCircle size={16} /> Settings saved successfully.
        </div>
      )}

      <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)', padding: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'bold', marginBottom: '8px' }}>Academy Name</label>
            <input value={settings.academyName} onChange={e => setSettings({...settings, academyName: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'bold', marginBottom: '8px' }}>Support Email</label>
            <input value={settings.supportEmail} onChange={e => setSettings({...settings, supportEmail: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
          </div>

        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-default)', margin: '24px 0' }} />

        <div>
          <h3 style={{ fontSize: 'var(--text-md)', fontWeight: 'bold', marginBottom: '16px' }}>System Controls</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={settings.maintenanceMode} onChange={e => setSettings({...settings, maintenanceMode: e.target.checked})} style={{ width: '16px', height: '16px' }} />
              <div>
                <div style={{ fontWeight: 'bold' }}>Maintenance Mode</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Disable student and teacher access during updates.</div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={settings.registrationOpen} onChange={e => setSettings({...settings, registrationOpen: e.target.checked})} style={{ width: '16px', height: '16px' }} />
              <div>
                <div style={{ fontWeight: 'bold' }}>Open Enrollment</div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Allow new students to register accounts.</div>
              </div>
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};
