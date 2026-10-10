import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/services';
import { Users, UserCheck, Clock, Stethoscope, Building2, UserRound, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import type { AdminUser } from '../../types';

interface Stats {
  total: number;
  doctors: number;
  insurers: number;
  patients: number;
  pending: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const load = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        adminService.getStats(),
        adminService.getPending(),
      ]);
      setStats(statsRes.data.data);
      setPending(pendingRes.data.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (userId: string, name: string) => {
    setActionLoading(userId);
    try {
      await adminService.approveUser(userId);
      setMsg(`✅ ${name} approved successfully`);
      setPending(p => p.filter(u => u._id !== userId));
      setStats(s => s ? { ...s, pending: s.pending - 1 } : s);
    } catch {
      setMsg('❌ Failed to approve user');
    } finally {
      setActionLoading(null);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const handleReject = async (userId: string, name: string) => {
    if (!confirm(`Reject and remove ${name}'s account?`)) return;
    setActionLoading(userId);
    try {
      await adminService.rejectUser(userId);
      setMsg(`🗑 ${name}'s registration rejected`);
      setPending(p => p.filter(u => u._id !== userId));
      setStats(s => s ? { ...s, pending: s.pending - 1 } : s);
    } catch {
      setMsg('❌ Failed to reject user');
    } finally {
      setActionLoading(null);
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const statCards = [
    { label: 'Total Users', value: stats?.total ?? '—', icon: <Users size={20} />, color: '#2563eb', bg: '#eff6ff' },
    { label: 'Doctors', value: stats?.doctors ?? '—', icon: <Stethoscope size={20} />, color: '#0891b2', bg: '#ecfeff' },
    { label: 'Insurers', value: stats?.insurers ?? '—', icon: <Building2 size={20} />, color: '#0f766e', bg: '#f0fdfa' },
    { label: 'Patients', value: stats?.patients ?? '—', icon: <UserRound size={20} />, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Pending Approval', value: stats?.pending ?? '—', icon: <Clock size={20} />, color: '#d97706', bg: '#fffbeb' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#94a3b8', flexDirection: 'column', gap: 12 }}>
      <div className="spinner" />
      <span>Loading admin dashboard…</span>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>Admin Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Manage users, approvals, and system accounts</p>
      </div>

      {msg && (
        <div style={{
          background: msg.startsWith('✅') ? '#f0fdf4' : msg.startsWith('🗑') ? '#fefce8' : '#fef2f2',
          border: `1px solid ${msg.startsWith('✅') ? '#86efac' : msg.startsWith('🗑') ? '#fde047' : '#fecaca'}`,
          borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 14,
          color: msg.startsWith('✅') ? '#15803d' : msg.startsWith('🗑') ? '#92400e' : '#dc2626',
        }}>{msg}</div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statCards.map((card) => (
          <div key={card.label} className="card" style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10, background: card.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, flexShrink: 0,
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#0f172a' }}>{card.value}</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Approvals */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 28 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={18} color="#d97706" />
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>Pending Approvals</h2>
            {pending.length > 0 && (
              <span style={{ background: '#fef3c7', color: '#92400e', borderRadius: 12, padding: '2px 8px', fontSize: 12, fontWeight: 600 }}>
                {pending.length}
              </span>
            )}
          </div>
          <button
            onClick={() => navigate('/admin/pending')}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}
          >
            View all →
          </button>
        </div>

        {pending.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <UserCheck size={32} style={{ marginBottom: 8, opacity: 0.5 }} />
            <p style={{ margin: 0, fontSize: 14 }}>No pending approvals — you're all caught up!</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Name', 'Email', 'Role', 'Registered', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pending.slice(0, 5).map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500, color: '#0f172a', fontSize: 14 }}>{u.name}</td>
                  <td style={{ padding: '12px 16px', color: '#475569', fontSize: 13 }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                      background: u.role === 'doctor' ? '#eff6ff' : '#f0fdfa',
                      color: u.role === 'doctor' ? '#1d4ed8' : '#0f766e',
                    }}>
                      {u.role === 'doctor' ? '🩺 Doctor' : '🏢 Insurer'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 13 }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => handleApprove(u._id, u.name)}
                      disabled={actionLoading === u._id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                        background: '#f0fdf4', color: '#15803d', fontSize: 13, fontWeight: 600,
                      }}
                    >
                      <CheckCircle2 size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(u._id, u.name)}
                      disabled={actionLoading === u._id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                        background: '#fef2f2', color: '#dc2626', fontSize: 13, fontWeight: 600,
                      }}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <button
          onClick={() => navigate('/admin/add-user')}
          className="card"
          style={{
            padding: 20, border: '2px dashed #e2e8f0', background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', width: '100%',
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
            <Users size={20} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>Add Doctor / Insurer</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>Create a pre-approved account directly</div>
          </div>
        </button>
        <button
          onClick={() => navigate('/admin/users')}
          className="card"
          style={{
            padding: 20, border: '2px dashed #e2e8f0', background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', width: '100%',
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
            <UserCheck size={20} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>Manage All Users</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>View, deactivate, or manage existing users</div>
          </div>
        </button>
      </div>
    </div>
  );
};
