import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, Clock, XCircle, BarChart2 } from 'lucide-react';
import { preauthService } from '../../services/services';
import { type PreAuthRequest, type DashboardStats } from '../../types';
import { KpiCard } from '../../components/ui/KpiCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const InsurerDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<PreAuthRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, reqRes] = await Promise.all([
          preauthService.getStats(),
          preauthService.getAll({ limit: '6' }),
        ]);
        setStats(statsRes.data.data);
        setRecent(reqRes.data.data.requests);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;

  const chartData = stats ? [
    { name: 'Submitted', value: stats.pending, color: '#2563eb' },
    { name: 'Under Review', value: stats.underReview, color: '#0284c7' },
    { name: 'AI Processing', value: stats.aiProcessing, color: '#7c3aed' },
    { name: 'Missing Docs', value: stats.missingDocs, color: '#ea580c' },
    { name: 'Approved', value: stats.approved, color: '#16a34a' },
    { name: 'Rejected', value: stats.rejected, color: '#dc2626' },
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-header">Dashboard</h1>
          <p className="page-subheader">Pre-authorization requests overview</p>
        </div>
        <Link to="/insurer/pending" className="btn btn-primary">
          Review Pending →
        </Link>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCard title="Total Requests" value={stats?.total ?? 0} icon={<FileText size={20} />} accent="#0f766e" />
        <KpiCard title="Pending Review" value={(stats?.pending ?? 0) + (stats?.underReview ?? 0)} icon={<Clock size={20} />} accent="#d97706" sub="Awaiting action" />
        <KpiCard title="Approved" value={stats?.approved ?? 0} icon={<CheckCircle size={20} />} accent="#16a34a" />
        <KpiCard title="Rejected" value={stats?.rejected ?? 0} icon={<XCircle size={20} />} accent="#dc2626" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Bar Chart */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={16} color="#64748b" /> Status Distribution
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick stats */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Quick Stats</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Missing Documents', value: stats?.missingDocs ?? 0, color: '#ea580c' },
              { label: 'AI Processing', value: stats?.aiProcessing ?? 0, color: '#7c3aed' },
              { label: 'Info Required', value: stats?.additionalInfo ?? 0, color: '#ca8a04' },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                  <span style={{ fontSize: 13, color: '#374151' }}>{s.label}</span>
                </div>
                <span style={{ fontWeight: 700, color: s.color, fontSize: 16 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent requests */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>Recent Requests</span>
          <Link to="/insurer/all-claims" style={{ fontSize: 13, color: '#0f766e', fontWeight: 500, textDecoration: 'none' }}>View all →</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Patient</th>
              <th>Procedure</th>
              <th>Provider</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>No requests yet</td></tr>
            )}
            {recent.map((r) => (
              <tr key={r._id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/insurer/review/${r._id}`}>
                <td><span style={{ fontWeight: 600, color: '#0f766e' }}>{r.requestId}</span></td>
                <td>{r.patientInfo.name}</td>
                <td>{r.treatmentDetails.procedureName}</td>
                <td>{r.insuranceDetails.provider}</td>
                <td>{formatCurrency(r.requestedAmount)}</td>
                <td><StatusBadge status={r.status} /></td>
                <td style={{ color: '#64748b' }}>{formatDate(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
