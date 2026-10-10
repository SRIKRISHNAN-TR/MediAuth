import React, { useEffect, useState } from 'react';
import {
  User, Shield, Bell, Building, Save, Lock, CheckCircle2,
  AlertCircle, Loader2, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/services';

type Tab = 'profile' | 'security' | 'notifications' | 'organization';

export const SettingsPage: React.FC = () => {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile Form State
  const [name, setName] = useState('');
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Notification Preferences State (stored in localStorage)
  const [emailAlerts, setEmailAlerts] = useState(() => localStorage.getItem('pref_email') !== 'false');
  const [claimUpdates, setClaimUpdates] = useState(() => localStorage.getItem('pref_claims') !== 'false');
  const [aiAlerts, setAiAlerts] = useState(() => localStorage.getItem('pref_ai') !== 'false');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('pref_sound') !== 'false');
  const [notifSuccess, setNotifSuccess] = useState(false);

  useEffect(() => {
    authService
      .getMe()
      .then((res) => {
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
      })
      .catch(console.error)
      .finally(() => setLoadingProfile(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSavingProfile(true);
    try {
      await authService.updateMe({ name, ...profile });
      setProfileSuccess('Profile updated successfully.');
      setTimeout(() => setProfileSuccess(''), 4000);
    } catch {
      setProfileError('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setPasswordError(msg || 'Failed to change password. Please check current password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveNotifs = () => {
    localStorage.setItem('pref_email', String(emailAlerts));
    localStorage.setItem('pref_claims', String(claimUpdates));
    localStorage.setItem('pref_ai', String(aiAlerts));
    localStorage.setItem('pref_sound', String(soundEnabled));
    setNotifSuccess(true);
    setTimeout(() => setNotifSuccess(false), 3000);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <User size={16} /> },
    { id: 'security', label: 'Security & Auth', icon: <Shield size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'organization', label: 'System & Organization', icon: <Building size={16} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860 }}>
      <div>
        <h1 className="page-header">Settings</h1>
        <p className="page-subheader">Manage your account preferences, credentials, and notification settings</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 2 }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                background: isActive ? '#fff' : 'transparent',
                borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                color: isActive ? '#2563eb' : '#64748b',
                fontWeight: isActive ? 600 : 500,
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px', color: '#0f172a' }}>
            Personal & Role Profile
          </h2>

          {loadingProfile ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading profile…</div>
          ) : (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {profileSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', color: '#16a34a', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                  <CheckCircle2 size={16} /> {profileSuccess}
                </div>
              )}
              {profileError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                  <AlertCircle size={16} /> {profileError}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address (Account ID)</label>
                  <input
                    className="form-input"
                    value={user?.email || ''}
                    disabled
                    style={{ background: '#f8fafc', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              {/* Role-specific fields */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                  {role?.toUpperCase()} Specific Details
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {role === 'doctor' && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Specialization</label>
                        <input
                          className="form-input"
                          value={profile.specialization || ''}
                          onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Hospital / Clinic</label>
                        <input
                          className="form-input"
                          value={profile.hospitalName || ''}
                          onChange={(e) => setProfile({ ...profile, hospitalName: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">NPI Number</label>
                        <input
                          className="form-input"
                          value={profile.npiNumber || ''}
                          onChange={(e) => setProfile({ ...profile, npiNumber: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Department</label>
                        <input
                          className="form-input"
                          value={profile.department || ''}
                          onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {role === 'patient' && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Insurance Provider</label>
                        <input
                          className="form-input"
                          value={profile.insuranceProvider || ''}
                          onChange={(e) => setProfile({ ...profile, insuranceProvider: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Insurance Plan</label>
                        <input
                          className="form-input"
                          value={profile.insurancePlan || ''}
                          onChange={(e) => setProfile({ ...profile, insurancePlan: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Policy Number</label>
                        <input
                          className="form-input"
                          value={profile.insurancePolicyNumber || ''}
                          onChange={(e) => setProfile({ ...profile, insurancePolicyNumber: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Gender</label>
                        <select
                          className="form-input"
                          value={profile.gender || ''}
                          onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </>
                  )}

                  {role === 'insurer' && (
                    <>
                      <div className="form-group">
                        <label className="form-label">Organization Name</label>
                        <input
                          className="form-input"
                          value={profile.organizationName || ''}
                          onChange={(e) => setProfile({ ...profile, organizationName: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Department</label>
                        <input
                          className="form-input"
                          value={profile.department || ''}
                          onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">License Number</label>
                        <input
                          className="form-input"
                          value={profile.licenseNumber || ''}
                          onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      className="form-input"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                  {savingProfile ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Profile Changes</>}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px', color: '#0f172a' }}>
              Change Password
            </h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>
              Ensure your account is using a secure and unique password.
            </p>

            <form onSubmit={handleSavePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 440 }}>
              {passwordSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', color: '#16a34a', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                  <CheckCircle2 size={16} /> {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                  <AlertCircle size={16} /> {passwordError}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={savingPassword} style={{ marginTop: 8 }}>
                {savingPassword ? <><Loader2 size={14} className="animate-spin" /> Updating…</> : <><Lock size={14} /> Update Password</>}
              </button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px', color: '#0f172a' }}>
              Active Authentication Session
            </h3>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Your session is authenticated via signed JSON Web Tokens (JWT) with strict Role-Based Access Control (RBAC).
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 16, fontSize: 12, color: '#334155' }}>
              <div><strong>Role:</strong> {role}</div>
              <div><strong>Token Expiry:</strong> 7 days</div>
              <div><strong>Storage:</strong> LocalStorage Session</div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card">
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>
            Notification Preferences
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 20px' }}>
            Configure when and how you receive alerts regarding pre-authorization requests.
          </p>

          {notifSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', color: '#16a34a', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              <CheckCircle2 size={16} /> Notification preferences updated!
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: 8, cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Email Alerts</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Receive email digests for claim updates and decisions</div>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: 8, cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Claim Status Notifications</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Instant alerts whenever a claim status changes or documents are verified</div>
              </div>
              <input
                type="checkbox"
                checked={claimUpdates}
                onChange={(e) => setClaimUpdates(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: 8, cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>AI Validation Notifications</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Receive alerts when Gemini AI finishes pre-authorization scoring and flag checks</div>
              </div>
              <input
                type="checkbox"
                checked={aiAlerts}
                onChange={(e) => setAiAlerts(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f8fafc', borderRadius: 8, cursor: 'pointer' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>In-App Audio Chimes</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Play subtle sound when a real-time notification arrives</div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
            </label>
          </div>

          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleSaveNotifs}>
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Organization / System Tab */}
      {activeTab === 'organization' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card">
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px', color: '#0f172a' }}>
              System Configuration & Architecture
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Platform Version</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>MediAuth AI v1.0.0</div>
                <div style={{ fontSize: 12, color: '#16a34a', marginTop: 2 }}>Production Build Ready</div>
              </div>

              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>AI Engine</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0f766e', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={16} /> Gemini 1.5 Flash
                </div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Decision Support Only</div>
              </div>

              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Database Status</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#16a34a', marginTop: 4 }}>MongoDB Active</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Cluster Connected</div>
              </div>

              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Security Standard</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#2563eb', marginTop: 4 }}>JWT + Strict RBAC</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Role-Isolated APIs</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
