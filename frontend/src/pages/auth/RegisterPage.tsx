import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/services';
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Role } from '../../types';
import { useAuth } from '../../context/AuthContext';

type Step = 'role' | 'account' | 'profile';

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<Role | ''>('');
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    specialization: '', hospitalName: '', npiNumber: '', department: '',
    dateOfBirth: '', gender: '', phone: '',
    insurancePlan: '', insuranceProvider: '', insurancePolicyNumber: '',
    organizationName: '', licenseNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    setError(''); setLoading(true);
    try {
      const res = await authService.register({ ...form, role: role as Role });
      const data = res.data?.data;
      // Patients get auto-approved and logged in; doctors/insurers must wait for admin
      if (data?.pending) {
        setPendingApproval(true);
      } else {
        await login(form.email, form.password);
        const stored = localStorage.getItem('mediauth_user');
        const user = stored ? JSON.parse(stored) : null;
        if (user?.role === 'doctor') navigate('/doctor/dashboard', { replace: true });
        else if (user?.role === 'patient') navigate('/patient/dashboard', { replace: true });
        else if (user?.role === 'insurer') navigate('/insurer/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const roles: { value: Role; label: string; desc: string; color: string }[] = [
    { value: 'doctor', label: 'Doctor / Clinician', desc: 'Submit pre-auth requests for your patients', color: '#2563eb' },
    { value: 'patient', label: 'Patient', desc: 'Track your insurance claims and approvals', color: '#7c3aed' },
    { value: 'insurer', label: 'Insurance Reviewer', desc: 'Review and process authorization requests', color: '#0f766e' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: '#f8fafc',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        {pendingApproval ? (
          <div className="card" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>
              Registration Submitted!
            </h2>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
              Your account is pending admin approval. You'll be able to log in once an administrator
              reviews and approves your request.
            </p>
            <p style={{ color: '#94a3b8', fontSize: 12, margin: '0 0 24px' }}>
              Registered as: <strong>{form.email}</strong>
            </p>
            <a href="/login" style={{
              display: 'inline-block', padding: '10px 24px', background: '#2563eb',
              color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14,
            }}>Back to Login</a>
          </div>
        ) : (
        <><div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: '#2563eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
              }}>
                <span style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>M</span>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Create account</h1>
              <p style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Join MediAuth AI</p>
            </div><div className="card" style={{ padding: 32 }}>
                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
                    {error}
                  </div>
                )}

                {/* Step 1: Choose Role */}
                {step === 'role' && (
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 16 }}>Select your role</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {roles.map((r) => (
                        <button
                          key={r.value}
                          id={`role-${r.value}`}
                          onClick={() => setRole(r.value)}
                          style={{
                            padding: '14px 16px', border: `2px solid ${role === r.value ? r.color : '#e2e8f0'}`,
                            borderRadius: 10, background: role === r.value ? `${r.color}08` : '#fff',
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ fontWeight: 600, color: role === r.value ? r.color : '#0f172a', fontSize: 14 }}>{r.label}</div>
                          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{r.desc}</div>
                        </button>
                      ))}
                    </div>
                    <button
                      id="register-next-role"
                      className="btn btn-primary"
                      onClick={() => role && setStep('account')}
                      disabled={!role}
                      style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}
                    >
                      Continue <ChevronRight size={15} />
                    </button>
                  </div>
                )}

                {/* Step 2: Account Info */}
                {step === 'account' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>Account details</p>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input className="form-input" placeholder="Dr. Sarah Chen" value={form.name} onChange={(e) => set('name', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set('email', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => set('password', e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                      <button className="btn btn-secondary" onClick={() => setStep('role')} style={{ flex: 1, justifyContent: 'center' }}>
                        <ChevronLeft size={15} /> Back
                      </button>
                      <button className="btn btn-primary" onClick={() => form.name && form.email && form.password && setStep('profile')}
                        disabled={!form.name || !form.email || !form.password} style={{ flex: 2, justifyContent: 'center' }}>
                        Continue <ChevronRight size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Role Profile */}
                {step === 'profile' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', margin: '0 0 4px' }}>
                      {role === 'doctor' ? 'Professional details' : role === 'patient' ? 'Patient details' : 'Organization details'}
                    </p>

                    {role === 'doctor' && <>
                      <div className="form-group">
                        <label className="form-label">Specialization</label>
                        <input className="form-input" placeholder="Cardiology" value={form.specialization} onChange={(e) => set('specialization', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Hospital Name</label>
                        <input className="form-input" placeholder="City General Hospital" value={form.hospitalName} onChange={(e) => set('hospitalName', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">NPI Number</label>
                        <input className="form-input" placeholder="1234567890" value={form.npiNumber} onChange={(e) => set('npiNumber', e.target.value)} />
                      </div>
                    </>}

                    {role === 'patient' && <>
                      <div className="form-group">
                        <label className="form-label">Date of Birth</label>
                        <input className="form-input" type="date" value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Gender</label>
                        <select className="form-input" value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Insurance Provider</label>
                        <input className="form-input" placeholder="BlueCross BlueShield" value={form.insuranceProvider} onChange={(e) => set('insuranceProvider', e.target.value)} />
                      </div>
                    </>}

                    {role === 'insurer' && <>
                      <div className="form-group">
                        <label className="form-label">Organization Name</label>
                        <input className="form-input" placeholder="BlueCross BlueShield" value={form.organizationName} onChange={(e) => set('organizationName', e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Department</label>
                        <input className="form-input" placeholder="Claims Review" value={form.department} onChange={(e) => set('department', e.target.value)} />
                      </div>
                    </>}

                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                      <button className="btn btn-secondary" onClick={() => setStep('account')} style={{ flex: 1, justifyContent: 'center' }}>
                        <ChevronLeft size={15} /> Back
                      </button>
                      <button id="register-submit" className="btn btn-primary" onClick={handleRegister} disabled={loading} style={{ flex: 2, justifyContent: 'center' }}>
                        {loading ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : 'Create Account'}
                      </button>
                    </div>
                  </div>
                )}

                <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', marginTop: 20 }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>Sign in</Link>
                </p>
              </div></>
        )}
      </div>
    </div>
  );
};
