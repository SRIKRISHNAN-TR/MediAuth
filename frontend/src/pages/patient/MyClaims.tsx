import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { preauthService } from '../../services/services';
import type { PreAuthRequest } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Search, RefreshCw } from 'lucide-react';

const ALL_STATUSES = ['all', 'submitted', 'ai_processing', 'missing_documents', 'under_review', 'additional_info_required', 'approved', 'rejected'];

export const MyClaims: React.FC = () => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-header">My Claims</h1>
        <p className="page-subheader">Track all your pre-authorization requests</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 32, width: 220 }}
              placeholder="Search claims…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">Search</button>
        </form>
        <select className="form-input" style={{ width: 180 }} value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={load} title="Refresh"><RefreshCw size={14} /></button>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#64748b' }}>{total} claim{total !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Claim ID</th>
                <th>Procedure</th>
                <th>Hospital</th>
                <th>Provider</th>
                <th>Requested</th>
                <th>Approved</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No claims found.</td></tr>
              )}
              {requests.map((r) => (
                <tr key={r._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/patient/claim/${r._id}`)}>
                  <td><span style={{ fontWeight: 600, color: '#7c3aed' }}>{r.requestId}</span></td>
                  <td>{r.treatmentDetails.procedureName}</td>
                  <td>{r.treatmentDetails.hospitalName}</td>
                  <td>{r.insuranceDetails.provider}</td>
                  <td>{formatCurrency(r.requestedAmount)}</td>
                  <td>{r.approvedAmount ? formatCurrency(r.approvedAmount) : '—'}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td style={{ color: '#64748b' }}>{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
          <span style={{ padding: '5px 12px', fontSize: 13, color: '#64748b' }}>Page {page} of {totalPages}</span>
          <button className="btn btn-secondary btn-sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
};
