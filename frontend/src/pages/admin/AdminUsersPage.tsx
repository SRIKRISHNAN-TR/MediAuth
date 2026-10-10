import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/services';
import { Search, ShieldOff } from 'lucide-react';
import type { AdminUser } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filtered, setFiltered] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const res = await adminService.getAllUsers();
      const data = res.data.data || [];
      setUsers(data);
      setFiltered(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    let result = users;
    if (roleFilter) result = result.filter(u => u.role === roleFilter);
    if (search) result = result.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(result);
  }, [search, roleFilter, users]);

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3500); };

  const handleDeactivate = async (u: AdminUser) => {
    if (!confirm(`Deactivate ${u.name}'s account? They won't be able to log in.`)) return;
    setActionLoading(u._id);
    try {
      await adminService.deactivateUser(u._id);
      setUsers(prev => prev.map(x => x._id === u._id ? { ...x, isActive: false } : x));
      showMsg(`⛔ ${u.name}'s account deactivated.`);
    } catch (err: unknown) {
      const msg2 = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      showMsg(msg2 || '❌ Failed to deactivate.');
    } finally { setActionLoading(null); }
  };

  const roleBadge = (role: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      doctor: { bg: '#eff6ff', color: '#1d4ed8', label: '🩺 Doctor' },
      insurer: { bg: '#f0fdfa', color: '#0f766e', label: '🏢 Insurer' },
      patient: { bg: '#f5f3ff', color: '#7c3aed', label: '👤 Patient' },
      admin: { bg: '#fdf4ff', color: '#a21caf', label: '🛡 Admin' },
    };
    const s = map[role] || { bg: '#f8fafc', color: '#475569', label: role };
    return (
      <span style={{ padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
        {s.label}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 }}>All Users</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>View and manage all registered accounts on the platform.</p>
      </div>

      {msg && (
        <div style={{
          background: msg.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${msg.startsWith('✅') ? '#86efac' : '#fecaca'}`,
          borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 14,
          color: msg.startsWith('✅') ? '#15803d' : '#dc2626',
        }}>{msg}</div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 32, width: '100%' }}
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-input"
          style={{ width: 160 }}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="doctor">Doctor</option>
          <option value="insurer">Insurer</option>
          <option value="patient">Patient</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Name', 'Email', 'Role', 'Status', 'Approved', 'Registered', 'Action'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid #f8fafc', opacity: u.isActive ? 1 : 0.5 }}>
                  <td style={{ padding: '12px 14px', fontWeight: 500, color: '#0f172a', fontSize: 14 }}>{u.name}</td>
                  <td style={{ padding: '12px 14px', color: '#64748b', fontSize: 13 }}>{u.email}</td>
                  <td style={{ padding: '12px 14px' }}>{roleBadge(u.role)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                      background: u.isActive ? '#f0fdf4' : '#fef2f2',
                      color: u.isActive ? '#15803d' : '#dc2626',
                    }}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                      background: u.isApproved ? '#f0fdf4' : '#fefce8',
                      color: u.isApproved ? '#15803d' : '#92400e',
                    }}>
                      {u.isApproved ? '✓ Approved' : '⏳ Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#94a3b8', fontSize: 12 }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    {u.role !== 'admin' && u.isActive && (
                      <button
                        onClick={() => handleDeactivate(u)}
                        disabled={actionLoading === u._id}
                        title="Deactivate user"
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                          background: '#fef2f2', color: '#dc2626', fontSize: 12, fontWeight: 600,
                          opacity: actionLoading === u._id ? 0.6 : 1,
                        }}
                      >
                        <ShieldOff size={13} /> Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
                    No users found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
