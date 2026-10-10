import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Brain, FileText, CheckCircle, XCircle, AlertCircle,
  Clock, Loader2, Download,
} from 'lucide-react';
import type { PreAuthRequest, MedDocument, AIAnalysis } from '../../types';
import { preauthService, documentService, aiService } from '../../services/services';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfidenceGauge } from '../../components/ui/ConfidenceGauge';
import { AIPipeline } from '../../components/ui/AIPipeline';
import { formatCurrency, formatDate, formatDateTime, formatFileSize, getConfidenceColor, getRiskLevel } from '../../utils/helpers';

const VALID_NEXT: Record<string, string[]> = {
  submitted: ['under_review'],
  ai_processing: ['under_review', 'missing_documents'],
  missing_documents: ['under_review'],
  under_review: ['approved', 'rejected', 'additional_info_required'],
  additional_info_required: ['under_review'],
};

export const ReviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<PreAuthRequest | null>(null);
  const [docs, setDocs] = useState<MedDocument[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [activeAction, setActiveAction] = useState<'approve' | 'reject' | 'info' | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    if (!id) return;
    try {
      const [reqRes, docRes] = await Promise.all([
        preauthService.getById(id),
        documentService.getByRequest(id),
      ]);
      setRequest(reqRes.data.data);
      setDocs(docRes.data.data);
      try {
        const aiRes = await aiService.getAnalysis(id);
        setAnalysis(aiRes.data.data);
      } catch { /* no analysis */ }
    } catch { setError('Failed to load request.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleAction = async (newStatus: string) => {
    if (!request) return;
    setError(''); setSuccess('');
    if (newStatus === 'approved' && !approvedAmount) { setError('Please enter the approved amount.'); return; }
    if ((newStatus === 'rejected' || newStatus === 'additional_info_required') && !remarks) {
      setError('Please provide remarks.'); return;
    }
    setActionLoading(true);
    try {
      await preauthService.updateStatus(
        request._id,
        newStatus,
        remarks || undefined,
        approvedAmount ? parseFloat(approvedAmount) : undefined,
      );
      setSuccess(`Status updated to "${newStatus.replace(/_/g, ' ')}"`);
      setActiveAction(null);
      setRemarks('');
      setApprovedAmount('');
      await load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(msg || 'Action failed.');
    } finally { setActionLoading(false); }
  };

  const handleAnalyze = async () => {
    if (!request) return;
    setAnalyzing(true);
    try {
      await aiService.analyze(request._id);
      await load();
    } catch { setError('AI analysis failed.'); }
    finally { setAnalyzing(false); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;
  if (!request) return <div style={{ padding: 40, color: '#dc2626' }}>{error || 'Request not found.'}</div>;

  const risk = analysis ? getRiskLevel(analysis.confidenceScore) : null;
  const nextStatuses = VALID_NEXT[request.status] || [];
  const canAct = nextStatuses.length > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-header" style={{ margin: 0 }}>{request.requestId}</h1>
            <StatusBadge status={request.status} />
          </div>
          <p className="page-subheader">Submitted {formatDateTime(request.createdAt)}</p>
        </div>
        {(request.status === 'submitted' || request.status === 'missing_documents') && (
          <button className="btn btn-warning" onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? <><Loader2 size={14} className="animate-spin" /> Analyzing…</> : <><Brain size={14} /> Run AI</>}
          </button>
        )}
      </div>

      {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>{error}</div>}
      {success && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#16a34a' }}>{success}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Patient + Treatment */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Claim Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['Patient', request.patientInfo.name],
                ['DOB', request.patientInfo.dateOfBirth ? formatDate(request.patientInfo.dateOfBirth) : '—'],
                ['Gender', request.patientInfo.gender || '—'],
                ['Phone', request.patientInfo.phone || '—'],
                ['Procedure', request.treatmentDetails.procedureName],
                ['Hospital', request.treatmentDetails.hospitalName],
                ['CPT Code', request.treatmentDetails.cptCode || '—'],
                ['Diagnosis', request.treatmentDetails.diagnosisCode || '—'],
                ['ICD Code', request.treatmentDetails.icdCode || '—'],
                ['Est. Date', request.treatmentDetails.estimatedDate ? formatDate(request.treatmentDetails.estimatedDate) : '—'],
                ['Requested', formatCurrency(request.requestedAmount)],
                ['Approved', request.approvedAmount ? formatCurrency(request.approvedAmount) : '—'],
                ['Provider', request.insuranceDetails.provider],
                ['Plan', request.insuranceDetails.plan || '—'],
                ['Policy #', request.insuranceDetails.policyNumber || '—'],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</div>
                  <div style={{ fontSize: 14, color: '#0f172a', marginTop: 2 }}>{v}</div>
                </div>
              ))}
              {request.treatmentDetails.description && (
                <div style={{ gridColumn: '1/-1' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Description</div>
                  <div style={{ fontSize: 14, color: '#0f172a', marginTop: 2 }}>{request.treatmentDetails.description}</div>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Documents ({docs.length})</div>
            {docs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8', fontSize: 13 }}>No documents uploaded.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {docs.map((doc) => (
                  <div key={doc._id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                    background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9',
                  }}>
                    <FileText size={16} color="#64748b" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.originalName}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{doc.documentType.replace(/_/g, ' ')} · {formatFileSize(doc.fileSize)}</div>
                    </div>
                    <span className={`badge badge-${doc.verificationStatus}`}>{doc.verificationStatus}</span>
                    <a href={`/uploads/${doc.fileName}`} target="_blank" rel="noreferrer" style={{ color: '#64748b' }}>
                      <Download size={14} />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Panel */}
          {canAct && (
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Decision</div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                {nextStatuses.includes('approved') && (
                  <button
                    className="btn btn-success"
                    onClick={() => setActiveAction(activeAction === 'approve' ? null : 'approve')}
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                )}
                {nextStatuses.includes('rejected') && (
                  <button
                    className="btn btn-danger"
                    onClick={() => setActiveAction(activeAction === 'reject' ? null : 'reject')}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                )}
                {nextStatuses.includes('additional_info_required') && (
                  <button
                    className="btn btn-warning"
                    onClick={() => setActiveAction(activeAction === 'info' ? null : 'info')}
                  >
                    <AlertCircle size={14} /> Request Info
                  </button>
                )}
                {nextStatuses.includes('under_review') && !nextStatuses.includes('approved') && (
                  <button className="btn btn-secondary" onClick={() => handleAction('under_review')}>
                    Move to Under Review
                  </button>
                )}
              </div>

              {activeAction === 'approve' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Approved Amount (USD) *</label>
                    <input
                      className="form-input"
                      type="number"
                      placeholder={String(request.requestedAmount)}
                      value={approvedAmount}
                      onChange={(e) => setApprovedAmount(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Remarks (optional)</label>
                    <textarea className="form-input" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                  </div>
                  <button className="btn btn-success" onClick={() => handleAction('approved')} disabled={actionLoading}>
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Confirm Approval
                  </button>
                </div>
              )}

              {activeAction === 'reject' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Rejection Reason *</label>
                    <textarea className="form-input" rows={3} placeholder="Provide reason for rejection…" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                  </div>
                  <button className="btn btn-danger" onClick={() => handleAction('rejected')} disabled={actionLoading}>
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />} Confirm Rejection
                  </button>
                </div>
              )}

              {activeAction === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Information Required *</label>
                    <textarea className="form-input" rows={3} placeholder="Specify what additional information is needed…" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
                  </div>
                  <button className="btn btn-warning" onClick={() => handleAction('additional_info_required')} disabled={actionLoading}>
                    {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <AlertCircle size={14} />} Send Request
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reviewer remarks */}
          {request.reviewerRemarks && (
            <div className="card" style={{ borderLeft: '3px solid #d97706' }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#d97706' }}>Reviewer Remarks</div>
              <p style={{ fontSize: 14, color: '#374151', margin: 0 }}>{request.reviewerRemarks}</p>
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Timeline */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} color="#64748b" /> Timeline
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[...request.timeline].reverse().map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0f766e', flexShrink: 0, marginTop: 4 }} />
                    {i < request.timeline.length - 1 && <div style={{ width: 1, flex: 1, background: '#e2e8f0', minHeight: 16 }} />}
                  </div>
                  <div style={{ paddingBottom: 8 }}>
                    <StatusBadge status={t.status} />
                    {t.note && <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{t.note}</div>}
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{formatDateTime(t.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis */}
          {analysis ? (
            <div className="card">
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Brain size={16} color="#7c3aed" /> AI Analysis
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <ConfidenceGauge score={analysis.confidenceScore} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ textAlign: 'center', background: '#f8fafc', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: getConfidenceColor(analysis.policyMatchScore) }}>{analysis.policyMatchScore}%</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Policy Match</div>
                </div>
                <div style={{ textAlign: 'center', background: '#f8fafc', borderRadius: 8, padding: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: risk === 'low' ? '#16a34a' : risk === 'medium' ? '#d97706' : '#dc2626' }}>
                    {risk?.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Risk Level</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#374151', marginBottom: 10 }}>{analysis.summary}</div>
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Recommendation: </span>
                <span style={{
                  fontSize: 13, fontWeight: 700, padding: '2px 10px', borderRadius: 9999,
                  background: analysis.recommendation === 'approve' ? '#f0fdf4' : analysis.recommendation === 'reject' ? '#fef2f2' : '#fefce8',
                  color: analysis.recommendation === 'approve' ? '#16a34a' : analysis.recommendation === 'reject' ? '#dc2626' : '#d97706',
                }}>
                  {analysis.recommendation.toUpperCase()}
                </span>
              </div>
              {analysis.flags.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#dc2626', marginBottom: 4 }}>⚠ Flags</div>
                  {analysis.flags.map((f, i) => <div key={i} style={{ fontSize: 12, color: '#dc2626', paddingLeft: 8 }}>• {f}</div>)}
                </div>
              )}
              {analysis.missingDocuments.length > 0 && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#ea580c', marginBottom: 4 }}>📎 Missing</div>
                  {analysis.missingDocuments.map((d, i) => <div key={i} style={{ fontSize: 12, color: '#ea580c', paddingLeft: 8 }}>• {d}</div>)}
                </div>
              )}
              <AIPipeline pipeline={analysis.pipeline} />
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
              <Brain size={32} color="#e2e8f0" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 13, color: '#94a3b8' }}>No AI analysis available</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
