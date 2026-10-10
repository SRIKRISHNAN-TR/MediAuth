import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { preauthService } from '../../services/services';
import type { PreAuthRequest } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Search, RefreshCw } from 'lucide-react';

const REVIEW_STATUSES = ['all', 'submitted', 'under_review', 'missing_documents', 'additional_info_required'];

export const PendingReviews: React.FC = () => {
  const [requests, setRequests] = useState<PreAuthRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('under_review');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const LIMIT = 15;

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-header">Pending Reviews</h1>
          <p className="page-subheader">Claims awaiting your decision</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {REVIEW_STATUSES.slice(1).map((s) => (
            <button
              key={s}
              className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setStatus(s); setPage(1); }}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              className="form-input"
              style={{ paddingLeft: 32, width: 260 }}
              placeholder="Search by patient, procedure, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">Search</button>
        </form>
        <button className="btn btn-secondary btn-sm" onClick={load}><RefreshCw size={14} /></button>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#64748b' }}>{total} result{total !== 1 ? 's' : ''}</span>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Patient</th>
                <th>Procedure</th>
                <th>Provider</th>
                <th>Amount</th>
                <th>AI Score</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No pending reviews</td></tr>
              )}
              {requests.map((r) => {
                const ai = r.aiAnalysisId as unknown as { confidenceScore?: number; recommendation?: string } | null;
                return (
                  <tr key={r._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/insurer/review/${r._id}`)}>
                    <td><span style={{ fontWeight: 600, color: '#0f766e' }}>{r.requestId}</span></td>
                    <td>{r.patientInfo.name}</td>
                    <td>{r.treatmentDetails.procedureName}</td>
                    <td>{r.insuranceDetails.provider}</td>
                    <td>{formatCurrency(r.requestedAmount)}</td>
                    <td>
                      {ai?.confidenceScore != null ? (
                        <span style={{
                          fontWeight: 700, fontSize: 13,
                          color: ai.confidenceScore >= 80 ? '#16a34a' : ai.confidenceScore >= 60 ? '#d97706' : '#dc2626'
                        }}>
                          {ai.confidenceScore}%
                        </span>
                      ) : <span style={{ color: '#94a3b8' }}>—</span>}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                    <td style={{ color: '#64748b' }}>{formatDate(r.createdAt)}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => { e.stopPropagation(); navigate(`/insurer/review/${r._id}`); }}
                      >
                        Review →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

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
