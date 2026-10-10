import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle, XCircle, AlertCircle, Clock, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { preauthService } from '../../services/services';
import type { PreAuthRequest, DashboardStats } from '../../types';
import { KpiCard } from '../../components/ui/KpiCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<PreAuthRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [seeding, setSeeding] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, reqRes] = await Promise.all([
        preauthService.getStats(),
        preauthService.getAll({ limit: '5' }),
      ]);
      setStats(statsRes.data.data);
      setRecent(reqRes.data.data.requests);
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
      console.error('Failed to load sample requests', e);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div style={{ fontSize: 14, color: '#64748b' }}>Loading…</div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-header">Good morning, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="page-subheader">Here's your pre-authorization overview</p>
        </div>
        <Link to="/doctor/new-request" className="btn btn-primary">
          <Plus size={16} /> New Request
        </Link>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCard title="Total Requests" value={stats?.total ?? 0} icon={<FileText size={20} />} />
        <KpiCard title="Pending Review" value={stats?.pending ?? 0} icon={<Clock size={20} />} accent="#d97706" />
        <KpiCard title="Approved" value={stats?.approved ?? 0} icon={<CheckCircle size={20} />} accent="#16a34a" />
        <KpiCard title="Rejected" value={stats?.rejected ?? 0} icon={<XCircle size={20} />} accent="#dc2626" />
      </div>

      {/* Second row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KpiCard title="Under Review" value={stats?.underReview ?? 0} icon={<AlertCircle size={20} />} accent="#0284c7" />
        <KpiCard title="AI Processing" value={stats?.aiProcessing ?? 0} icon={<Clock size={20} />} accent="#7c3aed" />
        <KpiCard title="Missing Docs" value={stats?.missingDocs ?? 0} icon={<AlertCircle size={20} />} accent="#ea580c" />
        <KpiCard title="Info Required" value={stats?.additionalInfo ?? 0} icon={<AlertCircle size={20} />} accent="#ca8a04" />
      </div>

      {/* Recent Requests */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: '#0f172a' }}>Recent Requests</span>
          <Link to="/doctor/my-requests" style={{ fontSize: 13, color: '#2563eb', fontWeight: 500, textDecoration: 'none' }}>View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b', fontSize: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div>No requests yet for your doctor account.</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/doctor/new-request" className="btn btn-primary btn-sm">
                <Plus size={15} /> Create your first request
              </Link>
              <button onClick={handleLoadSamples} className="btn btn-secondary btn-sm" disabled={seeding}>
                {seeding ? 'Generating starter data…' : '✨ Load Starter Clinical Requests'}
              </button>
            </div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Patient</th>
                <th>Procedure</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r._id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/doctor/request/${r._id}`}>
                  <td><span style={{ fontWeight: 600, color: '#2563eb' }}>{r.requestId}</span></td>
                  <td>{r.patientInfo.name}</td>
                  <td style={{ maxWidth: 200 }}>{r.treatmentDetails.procedureName}</td>
                  <td>{formatCurrency(r.requestedAmount)}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td style={{ color: '#64748b' }}>{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
