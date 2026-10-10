import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { preauthService } from '../../services/services';
import type { DashboardStats } from '../../types';
import { BarChart2, TrendingUp, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    preauthService.getStats()
      .then((r) => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;
  if (!stats) return null;

  const barData = [
    { name: 'Submitted', value: stats.pending, color: '#2563eb' },
    { name: 'AI Processing', value: stats.aiProcessing, color: '#7c3aed' },
    { name: 'Missing Docs', value: stats.missingDocs, color: '#ea580c' },
    { name: 'Under Review', value: stats.underReview, color: '#0284c7' },
    { name: 'Info Required', value: stats.additionalInfo, color: '#ca8a04' },
    { name: 'Approved', value: stats.approved, color: '#16a34a' },
    { name: 'Rejected', value: stats.rejected, color: '#dc2626' },
  ];

  const pieData = [
    { name: 'Approved', value: stats.approved, fill: '#16a34a' },
    { name: 'Rejected', value: stats.rejected, fill: '#dc2626' },
    { name: 'Pending', value: stats.total - stats.approved - stats.rejected, fill: '#94a3b8' },
  ].filter((d) => d.value > 0);

  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;
  const rejectionRate = stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0;
  const pendingCount = stats.pending + stats.underReview + stats.aiProcessing;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-header">Analytics</h1>
        <p className="page-subheader">Pre-authorization claims overview and trends</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { title: 'Total Claims', value: stats.total, icon: <FileText size={20} />, color: '#0f766e' },
          { title: 'Approval Rate', value: `${approvalRate}%`, icon: <TrendingUp size={20} />, color: '#16a34a' },
          { title: 'Rejection Rate', value: `${rejectionRate}%`, icon: <XCircle size={20} />, color: '#dc2626' },
          { title: 'In Progress', value: pendingCount, icon: <Clock size={20} />, color: '#d97706' },
        ].map((k) => (
          <div key={k.title} className="kpi-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{k.title}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{k.value}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${k.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.color }}>
                {k.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Bar chart */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={16} color="#64748b" /> Status Distribution
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle size={16} color="#64748b" /> Outcome Breakdown
          </div>
          {pieData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: 13 }}>No completed claims yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Details grid */}
      <div className="card">
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 20 }}>Detailed Breakdown</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Approved', value: stats.approved, color: '#16a34a', bg: '#f0fdf4' },
            { label: 'Rejected', value: stats.rejected, color: '#dc2626', bg: '#fef2f2' },
            { label: 'Under Review', value: stats.underReview, color: '#2563eb', bg: '#eff6ff' },
            { label: 'AI Processing', value: stats.aiProcessing, color: '#7c3aed', bg: '#f5f3ff' },
            { label: 'Missing Docs', value: stats.missingDocs, color: '#ea580c', bg: '#fff7ed' },
            { label: 'Info Required', value: stats.additionalInfo, color: '#ca8a04', bg: '#fefce8' },
            { label: 'Submitted', value: stats.pending, color: '#0284c7', bg: '#f0f9ff' },
            { label: 'Total', value: stats.total, color: '#0f766e', bg: '#f0fdfa' },
          ].map((s) => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
