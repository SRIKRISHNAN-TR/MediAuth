import React, { useEffect, useState } from 'react';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { preauthService } from '../../services/services';
import type { PreAuthRequest, DashboardStats } from '../../types';
import { KpiCard } from '../../components/ui/KpiCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Link } from 'react-router-dom';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [claims, setClaims] = useState<PreAuthRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [seeding, setSeeding] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, claimRes] = await Promise.all([
        preauthService.getStats(),
        preauthService.getAll({ limit: '5' }),
      ]);
      setStats(statsRes.data.data);
      setClaims(claimRes.data.data.requests);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLoadSamples = async () => {
    setSeeding(true);
    try {
      await preauthService.seedSamples();
      await loadData();
    } catch (e) {
      console.error('Failed to load sample claims', e);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-header">Hello, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="page-subheader">Track your pre-authorization claims</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCard title="Total Claims" value={stats?.total ?? 0} icon={<FileText size={20} />} accent="#7c3aed" />
        <KpiCard title="Approved" value={stats?.approved ?? 0} icon={<CheckCircle size={20} />} accent="#16a34a" />
        <KpiCard title="Under Review" value={stats?.underReview ?? 0} icon={<Clock size={20} />} accent="#d97706" />
        <KpiCard title="Action Needed" value={(stats?.missingDocs ?? 0) + (stats?.additionalInfo ?? 0)} icon={<AlertCircle size={20} />} accent="#dc2626" />
      </div>

      {/* Claims table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, fontSize: 15 }}>My Claims</span>
          <Link to="/patient/my-claims" style={{ fontSize: 13, color: '#7c3aed', fontWeight: 500, textDecoration: 'none' }}>View all →</Link>
        </div>
        {claims.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b', fontSize: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div>No claims found for your account.</div>
            <button onClick={handleLoadSamples} className="btn btn-secondary btn-sm" disabled={seeding}>
              {seeding ? 'Generating starter claims…' : '✨ Load Starter Claims'}
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Procedure</th>
                <th>Hospital</th>
                <th>Requested</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((r) => (
                <tr key={r._id}>
                  <td><span style={{ fontWeight: 600, color: '#7c3aed' }}>{r.requestId}</span></td>
                  <td>{r.treatmentDetails.procedureName}</td>
                  <td>{r.treatmentDetails.hospitalName}</td>
                  <td>{formatCurrency(r.requestedAmount)}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td style={{ color: '#64748b' }}>{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Claim timeline for most recent */}
      {claims[0] && claims[0].timeline?.length > 0 && (
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Latest Claim Timeline</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...claims[0].timeline].reverse().slice(0, 5).map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7c3aed', marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}><StatusBadge status={t.status} /></div>
                  {t.note && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{t.note}</div>}
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{formatDate(t.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
