import React from 'react';

interface Props {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: string;
  sub?: string;
}

export const KpiCard: React.FC<Props> = ({ title, value, icon, accent = '#2563eb', sub }) => (
  <div className="kpi-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${accent}18`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent,
      }}>
        {icon}
      </div>
    </div>
  </div>
);
