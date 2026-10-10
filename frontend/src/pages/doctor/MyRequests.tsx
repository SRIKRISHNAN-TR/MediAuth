import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { preauthService } from '../../services/services';
import type { PreAuthRequest } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Plus, Search, RefreshCw } from 'lucide-react';

const ALL_STATUSES = ['all', 'draft', 'submitted', 'ai_processing', 'missing_documents', 'under_review', 'additional_info_required', 'approved', 'rejected'];

export const MyRequests: React.FC = () => {
  const [requests, setRequests] = useState<PreAuthRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const LIMIT = 10;

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: String(LIMIT) };
      if (search) params.search = search;
      if (status !== 'all') params.status = status;
      const res = await preauthService.getAll(params);
      setRequests(res.data.data.requests);
      setTotal(res.data.data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, status]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(); };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-header">My Requests</h1>
          <p className="page-subheader">{total} total pre-authorization request{total !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/doctor/new-request')}>
          <Plus size={16} /> New Request
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 32 }}
              placeholder="Search by ID, patient, or procedure…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary">Search</button>
        </form>
        <select className="form-input" style={{ width: 160 }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setStatus('all'); setPage(1); setTimeout(load, 0); }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Patient</th>
              <th>Procedure</th>
              <th>Hospital</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>Loading…</td></tr>
            )}
            {!loading && requests.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94a3b8' }}>No requests found</td></tr>
            )}
            {requests.map((r) => (
              <tr key={r._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/doctor/request/${r._id}`)}>
                <td><span style={{ fontWeight: 600, color: '#2563eb' }}>{r.requestId}</span></td>
                <td>{r.patientInfo.name}</td>
                <td>{r.treatmentDetails.procedureName}</td>
                <td>{r.treatmentDetails.hospitalName}</td>
                <td>{formatCurrency(r.requestedAmount)}</td>
                <td><StatusBadge status={r.status} /></td>
                <td style={{ color: '#64748b' }}>{formatDate(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>Page {page} of {totalPages} ({total} total)</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
              <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
