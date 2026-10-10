import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/services';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import type { AdminUser } from '../../types';

export const AdminPendingPage: React.FC = () => {
  const [pending, setPending] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const res = await adminService.getPending();
      setPending(res.data.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  const handleApprove = async (u: AdminUser) => {
    setActionLoading(u._id);
    try {
      await adminService.approveUser(u._id);
      setPending(p => p.filter(x => x._id !== u._id));
      showMsg(`✅ ${u.name} has been approved and can now log in.`);
    } catch {
      showMsg('❌ Failed to approve. Try again.');
    } finally { setActionLoading(null); }
  };

  const handleReject = async (u: AdminUser) => {
    if (!confirm(`Reject and permanently remove ${u.name}'s account?`)) return;
    setActionLoading(u._id);
    try {
      await adminService.rejectUser(u._id);
      setPending(p => p.filter(x => x._id !== u._id));
      showMsg(`🗑 ${u.name}'s registration has been rejected.`);
    } catch {
      showMsg('❌ Failed to reject. Try again.');
    } finally { setActionLoading(null); }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Clock size={22} color="#d97706" /> Pending Approvals
        </h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          Doctors and insurers who self-registered and are waiting for your approval to access the platform.
        </p>
      </div>

      {msg && (
        <div style={{
          background: msg.startsWith('✅') ? '#f0fdf4' : msg.startsWith('🗑') ? '#fefce8' : '#fef2f2',
          border: `1px solid ${msg.startsWith('✅') ? '#86efac' : msg.startsWith('🗑') ? '#fde047' : '#fecaca'}`,
          borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 14,
          color: msg.startsWith('✅') ? '#15803d' : msg.startsWith('🗑') ? '#92400e' : '#dc2626',
        }}>{msg}</div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60, color: '#94a3b8' }}>
          <div className="spinner" />
        </div>
      ) : pending.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
          <AlertCircle size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: '#475569', margin: '0 0 6px' }}>No pending requests</p>
          <p style={{ fontSize: 13, margin: 0 }}>All registrations have been processed. You're up to date!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {pending.map((u) => (
            <div key={u._id} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                background: u.role === 'doctor' ? '#eff6ff' : '#f0fdfa',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>
                {u.role === 'doctor' ? '🩺' : '🏢'}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: 15 }}>{u.name}</div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{u.email}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  <span style={{
                    padding: '1px 8px', borderRadius: 10, fontWeight: 600, marginRight: 8,
                    background: u.role === 'doctor' ? '#eff6ff' : '#f0fdfa',
                    color: u.role === 'doctor' ? '#1d4ed8' : '#0f766e',
                  }}>
                    {u.role === 'doctor' ? 'Doctor' : 'Insurer'}
                  </span>
                  Registered {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                <button
                  onClick={() => handleApprove(u)}
                  disabled={actionLoading === u._id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                    borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                    background: '#f0fdf4', color: '#15803d',
                    opacity: actionLoading === u._id ? 0.6 : 1,
                  }}
                >
                  <CheckCircle2 size={15} /> Approve
                </button>
                <button
                  onClick={() => handleReject(u)}
                  disabled={actionLoading === u._id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                    borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
                    background: '#fef2f2', color: '#dc2626',
                    opacity: actionLoading === u._id ? 0.6 : 1,
                  }}
                >
                  <XCircle size={15} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
