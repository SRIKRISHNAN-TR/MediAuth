import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Upload, Brain, Clock,
  XCircle, Loader2, Download,
} from 'lucide-react';
import type { PreAuthRequest, MedDocument, AIAnalysis } from '../../types';
import { preauthService, documentService, aiService } from '../../services/services';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfidenceGauge } from '../../components/ui/ConfidenceGauge';
import { AIPipeline } from '../../components/ui/AIPipeline';
import { formatCurrency, formatDate, formatDateTime, formatFileSize, getConfidenceColor, getRiskLevel } from '../../utils/helpers';

export const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<PreAuthRequest | null>(null);
  const [docs, setDocs] = useState<MedDocument[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadType, setUploadType] = useState('other');
  const [error, setError] = useState('');

  const load = async () => {
    if (!id) return;
    try {
      const [reqRes, docRes] = await Promise.all([
        preauthService.getById(id),
        documentService.getByRequest(id),
      ]);
      setRequest(reqRes.data.data);
      setDocs(docRes.data.data);

      // Load analysis if it exists
      try {
        const aiRes = await aiService.getAnalysis(id);
        setAnalysis(aiRes.data.data);
      } catch { /* no analysis yet */ }
    } catch (e) {
      console.error(e);
      setError('Failed to load request.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !request) return;
    const file = e.target.files[0];
    const fd = new FormData();
    fd.append('file', file);
    fd.append('requestId', request._id);
    fd.append('documentType', uploadType);
    setUploading(true);
    try {
      await documentService.upload(fd);
      await load();
    } catch { setError('Upload failed.'); }
    finally { setUploading(false); e.target.value = ''; }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document?')) return;
    await documentService.delete(docId);
    setDocs((d) => d.filter((x) => x._id !== docId));
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

  const handleSubmit = async () => {
    if (!request) return;
    setSubmitting(true);
    try {
      await preauthService.submit(request._id);
      await load();
    } catch { setError('Submission failed.'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>;
  if (!request) return <div style={{ padding: 40, color: '#dc2626' }}>{error || 'Request not found.'}</div>;

  const isDraft = request.status === 'draft';
  const canSubmit = isDraft && !!request.patientInfo?.name && !!request.treatmentDetails?.procedureName;
  const risk = analysis ? getRiskLevel(analysis.confidenceScore) : null;

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
          <p className="page-subheader">Created {formatDateTime(request.createdAt)}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isDraft && (
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
            >
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting…</> : 'Submit for Review'}
            </button>
          )}
          {(request.status === 'submitted' || request.status === 'missing_documents') && (
            <button className="btn btn-warning" onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? <><Loader2 size={14} className="animate-spin" /> Analyzing…</> : <><Brain size={14} /> Run AI Analysis</>}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Patient Info */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={16} color="#64748b" /> Patient Information
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['Full Name', request.patientInfo.name],
                ['Date of Birth', request.patientInfo.dateOfBirth ? formatDate(request.patientInfo.dateOfBirth) : '—'],
                ['Gender', request.patientInfo.gender || '—'],
                ['Phone', request.patientInfo.phone || '—'],
                ['Patient ID', request.patientInfo.patientIdRef || '—'],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                  <div style={{ fontSize: 14, color: '#0f172a', marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Treatment Details */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Treatment Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['Procedure', request.treatmentDetails.procedureName],
                ['Hospital', request.treatmentDetails.hospitalName],
                ['CPT Code', request.treatmentDetails.cptCode || '—'],
                ['Diagnosis Code', request.treatmentDetails.diagnosisCode || '—'],
                ['ICD Code', request.treatmentDetails.icdCode || '—'],
                ['Estimated Date', request.treatmentDetails.estimatedDate ? formatDate(request.treatmentDetails.estimatedDate) : '—'],
                ['Requested Amount', formatCurrency(request.requestedAmount)],
                ['Approved Amount', request.approvedAmount ? formatCurrency(request.approvedAmount) : '—'],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                  <div style={{ fontSize: 14, color: '#0f172a', marginTop: 2 }}>{val}</div>
                </div>
              ))}
              {request.treatmentDetails.description && (
                <div style={{ gridColumn: '1/-1' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Clinical Description</div>
                  <div style={{ fontSize: 14, color: '#0f172a', marginTop: 2 }}>{request.treatmentDetails.description}</div>
                </div>
              )}
            </div>
          </div>

          {/* Insurance Details */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Insurance Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['Provider', request.insuranceDetails.provider],
                ['Plan', request.insuranceDetails.plan || '—'],
                ['Policy Number', request.insuranceDetails.policyNumber || '—'],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
                  <div style={{ fontSize: 14, color: '#0f172a', marginTop: 2 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Upload size={16} color="#64748b" /> Documents ({docs.length})
              </span>
              {(isDraft || request.status === 'missing_documents') && (
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value)}
                    style={{ fontSize: 12, padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: 6, marginRight: 6 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="medical_report">Medical Report</option>
                    <option value="prescription">Prescription</option>
                    <option value="diagnostic_report">Diagnostic Report</option>
                    <option value="insurance_card">Insurance Card</option>
                    <option value="doctor_recommendation">Doctor Recommendation</option>
                    <option value="treatment_estimate">Treatment Estimate</option>
                    <option value="other">Other</option>
                  </select>
                  <span className="btn btn-secondary btn-sm">
                    {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />} Upload
                  </span>
                  <input type="file" style={{ display: 'none' }} onChange={handleUpload} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                </label>
              )}
            </div>
            {docs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: 13 }}>No documents uploaded yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {docs.map((doc) => (
                  <div key={doc._id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
                    background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9',
                  }}>
                    <FileText size={16} color="#64748b" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.originalName}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{doc.documentType.replace(/_/g, ' ')} · {formatFileSize(doc.fileSize)}</div>
                    </div>
                    <span className={`badge badge-${doc.verificationStatus}`}>{doc.verificationStatus}</span>
                    <a href={`/uploads/${doc.fileName}`} target="_blank" rel="noreferrer" style={{ color: '#64748b' }}>
                      <Download size={14} />
                    </a>
                    {isDraft && (
                      <button onClick={() => handleDelete(doc._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
                        <XCircle size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviewer Remarks */}
          {request.reviewerRemarks && (
            <div className="card" style={{ borderLeft: '3px solid #d97706' }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#d97706' }}>Reviewer Remarks</div>
              <p style={{ fontSize: 14, color: '#374151', margin: 0 }}>{request.reviewerRemarks}</p>
            </div>
          )}
        </div>

        {/* Right column */}
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
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', flexShrink: 0, marginTop: 4 }} />
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
          {analysis && (
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
                  <div style={{ fontSize: 13, fontWeight: 600, color: risk === 'low' ? '#16a34a' : risk === 'medium' ? '#d97706' : '#dc2626' }}>
                    {risk?.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Risk Level</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}><strong>Summary:</strong> {analysis.summary}</div>
              <div style={{ fontSize: 13, color: '#374151', marginBottom: 12 }}>
                <strong>Recommendation:</strong>{' '}
                <span style={{ color: analysis.recommendation === 'approve' ? '#16a34a' : analysis.recommendation === 'reject' ? '#dc2626' : '#d97706' }}>
                  {analysis.recommendation.toUpperCase()}
                </span>
              </div>
              {analysis.flags.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#dc2626', marginBottom: 4 }}>⚠ Flags</div>
                  {analysis.flags.map((f, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#dc2626', paddingLeft: 8 }}>• {f}</div>
                  ))}
                </div>
              )}
              {analysis.missingDocuments.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#ea580c', marginBottom: 4 }}>📎 Missing Documents</div>
                  {analysis.missingDocuments.map((d, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#ea580c', paddingLeft: 8 }}>• {d}</div>
                  ))}
                </div>
              )}
              <AIPipeline pipeline={analysis.pipeline} />
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 10 }}>Analyzed: {formatDateTime(analysis.processedAt)}</div>
            </div>
          )}

          {!analysis && request.status !== 'draft' && (
            <div className="card" style={{ textAlign: 'center', padding: '32px 20px' }}>
              <Brain size={32} color="#e2e8f0" style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 13, color: '#94a3b8' }}>No AI analysis yet</div>
              {(request.status === 'submitted' || request.status === 'missing_documents') && (
                <button className="btn btn-warning btn-sm" style={{ marginTop: 12 }} onClick={handleAnalyze} disabled={analyzing}>
                  {analyzing ? 'Analyzing…' : 'Run AI Analysis'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
