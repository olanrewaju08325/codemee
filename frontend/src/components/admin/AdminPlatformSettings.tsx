import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Loader } from 'lucide-react';
import apiClient from '../../apiClient';

interface PlatformSetting {
  setting_key: string;
  setting_value: string;
  description: string;
}

export const AdminPlatformSettings: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await apiClient.admin.getAllSettings();
        setSettings(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load platform settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.setting_key === key ? { ...s, setting_value: value } : s));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      for (const setting of settings) {
        await apiClient.admin.updateSetting(setting.setting_key, { setting_value: setting.setting_value });
      }
      setSuccess('All settings updated successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader className="animate-spin" /></div>;
  }

  return (
    <div className="bg-[var(--surface-dark)] p-6 rounded-xl border border-[var(--border)] mb-8">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Save size={20} className="text-[var(--color-blue)]" />
        Business & Platform Settings
      </h2>

      {error && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 text-green-500 p-4 rounded-lg mb-6">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settings.map(setting => (
          <div key={setting.setting_key}>
            <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
              {setting.setting_key.replace(/_/g, ' ')}
            </label>
            <input
              type="text"
              value={setting.setting_value || ''}
              onChange={(e) => handleChange(setting.setting_key, e.target.value)}
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 text-[var(--text-primary)]"
            />
            <p className="text-xs text-[var(--muted)] mt-1">{setting.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[var(--color-blue)] text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};
