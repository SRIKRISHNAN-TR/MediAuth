import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/services';
import { User, Save, Loader2, CheckCircle } from 'lucide-react';
import { getInitials } from '../../utils/helpers';

export const ProfilePage: React.FC = () => {
  const { user, role } = useAuth();
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    authService.getMe().then((res) => {
      const u = res.data.data.user;
      const p = res.data.data.profile;
      setName(u.name || '');
      if (p) {
        const flat: Record<string, string> = {};
        Object.entries(p).forEach(([k, v]) => {
          if (typeof v === 'string') flat[k] = v;
        });
        setProfile(flat);
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSaving(true); setSuccess(false);
    try {
      await authService.updateMe({ name, ...profile });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch { setError('Failed to save profile.'); }
    finally { setSaving(false); }
  };

  const profileFields: Record<string, { label: string; fields: { key: string; label: string; type?: string }[] }> = {
    doctor: {
      label: 'Doctor Profile',
      fields: [
        { key: 'specialization', label: 'Specialization' },
        { key: 'hospitalName', label: 'Hospital Name' },
        { key: 'npiNumber', label: 'NPI Number' },
        { key: 'department', label: 'Department' },
        { key: 'phone', label: 'Phone' },
      ],
    },
    patient: {
      label: 'Patient Profile',
      fields: [
        { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
        { key: 'gender', label: 'Gender' },
        { key: 'phone', label: 'Phone' },
        { key: 'insuranceProvider', label: 'Insurance Provider' },
        { key: 'insurancePlan', label: 'Insurance Plan' },
        { key: 'insurancePolicyNumber', label: 'Policy Number' },
      ],
    },
    insurer: {
      label: 'Insurer Profile',
      fields: [
        { key: 'organizationName', label: 'Organization Name' },
        { key: 'department', label: 'Department' },
        { key: 'licenseNumber', label: 'License Number' },
        { key: 'phone', label: 'Phone' },
      ],
    },
  };

  const section = role ? profileFields[role] : null;

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      <div>
        <h1 className="page-header">Profile</h1>
        <p className="page-subheader">Manage your account information</p>
      </div>

      {/* Avatar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: role === 'doctor' ? '#eff6ff' : role === 'patient' ? '#f5f3ff' : '#f0fdfa',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, fontWeight: 700,
          color: role === 'doctor' ? '#2563eb' : role === 'patient' ? '#7c3aed' : '#0f766e',
        }}>
          {getInitials(user?.name || 'U')}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>{user?.email}</div>
          <span style={{
            fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 9999, marginTop: 6, display: 'inline-block',
            background: role === 'doctor' ? '#eff6ff' : role === 'patient' ? '#f5f3ff' : '#f0fdfa',
            color: role === 'doctor' ? '#2563eb' : role === 'patient' ? '#7c3aed' : '#0f766e',
          }}>
            {role?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>{error}</div>}
        {success && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={14} /> Profile saved successfully!
          </div>
        )}

        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} color="#64748b" /> Account Info
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Full Name</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user?.email || ''} disabled style={{ background: '#f8fafc', color: '#94a3b8' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <input className="form-input" value={role || ''} disabled style={{ background: '#f8fafc', color: '#94a3b8' }} />
            </div>
          </div>
        </div>

        {section && (
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>{section.label}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {section.fields.map((f) => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input
                    className="form-input"
                    type={f.type || 'text'}
                    value={profile[f.key] || ''}
                    onChange={(e) => setProfile((p) => ({ ...p, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Changes</>}
        </button>
      </form>
    </div>
  );
};
