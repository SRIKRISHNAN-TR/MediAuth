import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, FileText, CheckCircle2, Clock, AlertCircle, XCircle,
  ShieldCheck, Hospital, Calendar, Download, AlertTriangle,
  Activity
} from 'lucide-react';
import type { PreAuthRequest, MedDocument } from '../../types';
import { preauthService, documentService } from '../../services/services';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, formatDate, formatDateTime, formatFileSize } from '../../utils/helpers';

export const ClaimDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<PreAuthRequest | null>(null);
  const [documents, setDocuments] = useState<MedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [claimRes, docRes] = await Promise.all([
          preauthService.getById(id),
          documentService.getByRequest(id),
        ]);
        setClaim(claimRes.data.data);
        setDocuments(docRes.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load claim details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading claim details…</div>;
  }

  if (error || !claim) {
    return (
      <div style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/patient/my-claims')}>
          <ArrowLeft size={14} /> Back to My Claims
        </button>
        <div style={{ color: '#dc2626' }}>{error || 'Claim not found.'}</div>
      </div>
    );
  }

  // Stepper calculations
  const status = claim.status;
  const isApproved = status === 'approved';
  const isRejected = status === 'rejected';
  const isActionNeeded = status === 'missing_documents' || status === 'additional_info_required';

  const steps = [
    {
      label: 'Submitted',
      sublabel: formatDate(claim.createdAt),
      status: 'completed',
    },
    {
      label: 'AI Validation',
      sublabel: status === 'ai_processing' ? 'Processing…' : status === 'submitted' ? 'Queued' : 'Validated',
      status: status === 'submitted' ? 'pending' : status === 'ai_processing' ? 'current' : 'completed',
    },
    {
      label: 'Insurer Review',
      sublabel: status === 'under_review' ? 'In Progress' : ['approved', 'rejected', 'additional_info_required'].includes(status) ? 'Completed' : 'Pending',
      status: status === 'under_review' ? 'current' : ['approved', 'rejected', 'additional_info_required'].includes(status) ? 'completed' : 'pending',
    },
    {
      label: isApproved ? 'Approved' : isRejected ? 'Rejected' : isActionNeeded ? 'Action Required' : 'Final Decision',
      sublabel: isApproved ? 'Coverage Granted' : isRejected ? 'Claim Denied' : isActionNeeded ? 'Review Needed' : 'Awaiting Review',
      status: isApproved ? 'completed' : isRejected ? 'rejected' : isActionNeeded ? 'warning' : 'pending',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000 }}>
      {/* Top breadcrumb & back */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/patient/my-claims')}>
          <ArrowLeft size={14} /> Back to My Claims
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>Claim Status:</span>
          <StatusBadge status={claim.status} />
        </div>
      </div>

      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
          color: '#fff',
          padding: '24px 28px',
          borderRadius: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.85, fontWeight: 600 }}>
              Pre-Authorization Request
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, margin: '6px 0 4px', color: '#fff' }}>
              {claim.treatmentDetails.procedureName}
            </h1>
            <p style={{ fontSize: 14, opacity: 0.9, margin: 0 }}>
              Claim ID: <span style={{ fontWeight: 700, letterSpacing: '0.03em' }}>{claim.requestId}</span> &bull; Submitted {formatDate(claim.createdAt)}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, opacity: 0.85 }}>Requested Amount</div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{formatCurrency(claim.requestedAmount)}</div>
            {claim.approvedAmount && (
              <div style={{ fontSize: 13, color: '#bbf7d0', marginTop: 2, fontWeight: 600 }}>
                Approved: {formatCurrency(claim.approvedAmount)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="card">
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: '#0f172a' }}>
          Claim Progress
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
          {steps.map((st, i) => {
            const isDone = st.status === 'completed';
            const isCurr = st.status === 'current';
            const isWarn = st.status === 'warning';
            const isRej = st.status === 'rejected';

            let circleBg = '#f1f5f9';
            let circleColor = '#94a3b8';
            let icon = <span>{i + 1}</span>;

            if (isDone) {
              circleBg = '#16a34a';
              circleColor = '#ffffff';
              icon = <CheckCircle2 size={18} />;
            } else if (isCurr) {
              circleBg = '#7c3aed';
              circleColor = '#ffffff';
              icon = <Clock size={16} className="animate-pulse" />;
            } else if (isWarn) {
              circleBg = '#d97706';
              circleColor = '#ffffff';
              icon = <AlertTriangle size={16} />;
            } else if (isRej) {
              circleBg = '#dc2626';
              circleColor = '#ffffff';
              icon = <XCircle size={18} />;
            }

            return (
              <React.Fragment key={st.label}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 1 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: circleBg,
                      color: circleColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 14,
                      boxShadow: isCurr ? '0 0 0 4px rgba(124, 58, 237, 0.2)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    {icon}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isCurr ? '#7c3aed' : '#1e293b', marginTop: 8, textAlign: 'center' }}>
                    {st.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center' }}>
                    {st.sublabel}
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      position: 'relative',
                      top: 18,
                      flex: 1,
                      height: 3,
                      background: isDone ? '#16a34a' : '#e2e8f0',
                      margin: '0 -10px',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Decision / Reviewer Callout */}
      {claim.reviewerRemarks && (
        <div
          className="card"
          style={{
            borderLeft: `4px solid ${isApproved ? '#16a34a' : isRejected ? '#dc2626' : '#d97706'}`,
            background: isApproved ? '#f0fdf4' : isRejected ? '#fef2f2' : '#fffbeb',
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            {isApproved ? (
              <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0 }} />
            ) : isRejected ? (
              <XCircle size={20} color="#dc2626" style={{ flexShrink: 0 }} />
            ) : (
              <AlertCircle size={20} color="#d97706" style={{ flexShrink: 0 }} />
            )}
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                {isApproved ? 'Approval Note from Insurer' : isRejected ? 'Reason for Rejection' : 'Additional Information Required'}
              </div>
              <p style={{ fontSize: 13, color: '#334155', margin: '4px 0 0' }}>{claim.reviewerRemarks}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2-column info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Treatment Details */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            <Activity size={18} color="#7c3aed" />
            Treatment & Clinical Details
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div>
              <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>Procedure</div>
              <div style={{ fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{claim.treatmentDetails.procedureName}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>CPT Code</div>
                <div style={{ fontWeight: 500, color: '#334155', marginTop: 2 }}>{claim.treatmentDetails.cptCode || 'N/A'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>ICD / Diagnosis</div>
                <div style={{ fontWeight: 500, color: '#334155', marginTop: 2 }}>{claim.treatmentDetails.diagnosisCode || 'N/A'}</div>
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>Hospital / Facility</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: '#334155', marginTop: 2 }}>
                <Hospital size={14} color="#64748b" />
                {claim.treatmentDetails.hospitalName}
              </div>
            </div>
            {claim.treatmentDetails.estimatedDate && (
              <div>
                <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>Estimated Date of Procedure</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, color: '#334155', marginTop: 2 }}>
                  <Calendar size={14} color="#64748b" />
                  {formatDate(claim.treatmentDetails.estimatedDate)}
                </div>
              </div>
            )}
            {claim.treatmentDetails.description && (
              <div>
                <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>Clinical Notes</div>
                <p style={{ margin: '4px 0 0', color: '#475569', lineHeight: 1.5, background: '#f8fafc', padding: '10px 12px', borderRadius: 6 }}>
                  {claim.treatmentDetails.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Insurance Details */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
            <ShieldCheck size={18} color="#7c3aed" />
            Insurance & Coverage Details
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13 }}>
            <div>
              <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>Provider</div>
              <div style={{ fontWeight: 600, color: '#0f172a', marginTop: 2 }}>{claim.insuranceDetails.provider}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>Plan Name</div>
                <div style={{ fontWeight: 500, color: '#334155', marginTop: 2 }}>{claim.insuranceDetails.plan || 'Standard'}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', fontWeight: 600 }}>Policy Number</div>
                <div style={{ fontWeight: 500, color: '#334155', marginTop: 2 }}>{claim.insuranceDetails.policyNumber || 'N/A'}</div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#64748b' }}>Requested Amount:</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(claim.requestedAmount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: '#64748b' }}>Approved Coverage:</span>
                <span style={{ fontWeight: 700, color: claim.approvedAmount ? '#16a34a' : '#64748b' }}>
                  {claim.approvedAmount ? formatCurrency(claim.approvedAmount) : 'Pending Review'}
                </span>
              </div>
              {claim.approvedAmount && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e2e8f0', paddingTop: 6 }}>
                  <span style={{ color: '#64748b' }}>Est. Patient Share:</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>
                    {formatCurrency(Math.max(0, claim.requestedAmount - claim.approvedAmount))}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Documents attached */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700 }}>
            <FileText size={18} color="#7c3aed" />
            Supporting Documents ({documents.length})
          </div>
          <Link to="/patient/documents" style={{ fontSize: 12, color: '#7c3aed', textDecoration: 'none', fontWeight: 600 }}>
            Manage All Documents &rarr;
          </Link>
        </div>

        {documents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#94a3b8', fontSize: 13 }}>
            No documents uploaded for this claim.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {documents.map((doc) => (
              <div
                key={doc._id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: '#f8fafc',
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 6,
                    background: '#ede9fe',
                    color: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FileText size={20} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#0f172a',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={doc.originalName}
                  >
                    {doc.originalName}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>
                    {doc.documentType.replace(/_/g, ' ')} &bull; {formatFileSize(doc.fileSize)}
                  </div>
                </div>
                <a
                  href={`http://localhost:5000/${doc.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '6px 8px' }}
                  title="Download / View"
                >
                  <Download size={14} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claim History Timeline */}
      {claim.timeline && claim.timeline.length > 0 && (
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Detailed Timeline</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[...claim.timeline].reverse().map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: idx === 0 ? '#7c3aed' : '#cbd5e1',
                    marginTop: 5,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge status={item.status} />
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{formatDateTime(item.timestamp)}</span>
                  </div>
                  {item.note && (
                    <div style={{ fontSize: 13, color: '#475569', marginTop: 4, background: '#f8fafc', padding: '6px 10px', borderRadius: 6 }}>
                      {item.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
