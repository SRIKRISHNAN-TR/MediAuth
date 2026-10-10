import React, { useState } from 'react';
import { adminService } from '../../services/services';
import { UserPlus, CheckCircle2 } from 'lucide-react';

type AddMode = 'doctor' | 'insurer';

const initialDoctor = { name: '', email: '', password: '', specialization: '', hospitalName: '', npiNumber: '', department: '', phone: '' };
const initialInsurer = { name: '', email: '', password: '', organizationName: '', department: '', licenseNumber: '', phone: '' };

export const AdminAddUserPage: React.FC = () => {
  const [mode, setMode] = useState<AddMode>('doctor');
  const [doctorForm, setDoctorForm] = useState(initialDoctor);
  const [insurerForm, setInsurerForm] = useState(initialInsurer);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const setD = (k: string, v: string) => setDoctorForm(f => ({ ...f, [k]: v }));
  const setI = (k: string, v: string) => setInsurerForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'doctor') {
        const res = await adminService.addDoctor(doctorForm);
        const u = res.data.data;
        setSuccess(`✅ Doctor account created: ${u.name} (${u.email}) — login is active immediately.`);
        setDoctorForm(initialDoctor);
      } else {
        const res = await adminService.addInsurer(insurerForm);
        const u = res.data.data;
        setSuccess(`✅ Insurer account created: ${u.name} (${u.email}) — login is active immediately.`);
        setInsurerForm(initialInsurer);
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(msg || 'Failed to create account. Please try again.');
    } finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5,
  };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <UserPlus size={22} /> Add New User
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          Accounts created here are immediately approved — no pending review required.
        </p>
      </div>

      {success && (
        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#15803d', display: 'flex', gap: 8, alignItems: 'center' }}>
          <CheckCircle2 size={16} /> {success}
        </div>
      )}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#dc2626' }}>
          {error}
        </div>
      )}

      {/* Toggle */}
      <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 10, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {(['doctor', 'insurer'] as AddMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '8px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
              background: mode === m ? '#ffffff' : 'transparent',
              color: mode === m ? '#0f172a' : '#64748b',
              boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {m === 'doctor' ? '🩺 Doctor' : '🏢 Insurer'}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 28 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Common fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input
                style={inputStyle}
                value={mode === 'doctor' ? doctorForm.name : insurerForm.name}
                onChange={(e) => mode === 'doctor' ? setD('name', e.target.value) : setI('name', e.target.value)}
                placeholder={mode === 'doctor' ? 'Dr. Jane Smith' : 'John Reviewer'}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address *</label>
              <input
                type="email"
                style={inputStyle}
                value={mode === 'doctor' ? doctorForm.email : insurerForm.email}
                onChange={(e) => mode === 'doctor' ? setD('email', e.target.value) : setI('email', e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Password *</label>
              <input
                type="password"
                style={inputStyle}
                value={mode === 'doctor' ? doctorForm.password : insurerForm.password}
                onChange={(e) => mode === 'doctor' ? setD('password', e.target.value) : setI('password', e.target.value)}
                placeholder="Strong password"
                required minLength={6}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input
                style={inputStyle}
                value={mode === 'doctor' ? doctorForm.phone : insurerForm.phone}
                onChange={(e) => mode === 'doctor' ? setD('phone', e.target.value) : setI('phone', e.target.value)}
                placeholder="+1 555-0100"
              />
            </div>
          </div>

          {/* Role-specific fields */}
          {mode === 'doctor' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Specialization *</label>
                  <input
                    style={inputStyle}
                    value={doctorForm.specialization}
                    onChange={(e) => setD('specialization', e.target.value)}
                    placeholder="Cardiology"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Hospital Name *</label>
                  <input
                    style={inputStyle}
                    value={doctorForm.hospitalName}
                    onChange={(e) => setD('hospitalName', e.target.value)}
                    placeholder="City General Hospital"
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>NPI Number</label>
                  <input
                    style={inputStyle}
                    value={doctorForm.npiNumber}
                    onChange={(e) => setD('npiNumber', e.target.value)}
                    placeholder="NPI-1234567890"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Department</label>
                  <input
                    style={inputStyle}
                    value={doctorForm.department}
                    onChange={(e) => setD('department', e.target.value)}
                    placeholder="Cardiac Surgery"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Organization Name *</label>
                  <input
                    style={inputStyle}
                    value={insurerForm.organizationName}
                    onChange={(e) => setI('organizationName', e.target.value)}
                    placeholder="BlueCross BlueShield"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Department</label>
                  <input
                    style={inputStyle}
                    value={insurerForm.department}
                    onChange={(e) => setI('department', e.target.value)}
                    placeholder="Pre-Authorization"
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>License Number</label>
                <input
                  style={inputStyle}
                  value={insurerForm.licenseNumber}
                  onChange={(e) => setI('licenseNumber', e.target.value)}
                  placeholder="INS-2024-001"
                />
              </div>
            </>
          )}

          <div style={{ paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 24px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: 14,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Creating…' : `Create ${mode === 'doctor' ? 'Doctor' : 'Insurer'} Account`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
