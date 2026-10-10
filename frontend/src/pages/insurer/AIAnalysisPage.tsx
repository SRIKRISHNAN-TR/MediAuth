import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Brain, AlertTriangle,
  RefreshCw, ArrowRight, FileText, AlertCircle, Sparkles,
  Loader2, Info
} from 'lucide-react';
import type { PreAuthRequest, AIAnalysis, MedDocument } from '../../types';
import { preauthService, aiService, documentService } from '../../services/services';
import { ConfidenceGauge } from '../../components/ui/ConfidenceGauge';
import { AIPipeline } from '../../components/ui/AIPipeline';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatCurrency, getRiskInfo } from '../../utils/helpers';

export const AIAnalysisPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState<PreAuthRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [activeRequest, setActiveRequest] = useState<PreAuthRequest | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [documents, setDocuments] = useState<MedDocument[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState('');

  // Fetch all reviewed/submitted claims
  const loadRequests = async () => {
    setLoadingList(true);
    try {
      const res = await preauthService.getAll({ limit: '30' });
      const list = res.data.data.requests;
      setRequests(list);

      // Select request from URL query param or pick first
      const qId = searchParams.get('id');
      const initial = (qId && list.find((r: PreAuthRequest) => r._id === qId)) ? qId : list[0]?._id;
      if (initial) {
        setSelectedId(initial);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load requests.');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  // When selectedId changes, load detail + AI analysis
  useEffect(() => {
    if (!selectedId) return;
    const loadDetail = async () => {
      setLoadingDetail(true);
      setError('');
      try {
        const [reqRes, docRes] = await Promise.all([
          preauthService.getById(selectedId),
          documentService.getByRequest(selectedId),
        ]);
        setActiveRequest(reqRes.data.data);
        setDocuments(docRes.data.data);

        try {
          const aiRes = await aiService.getAnalysis(selectedId);
          setAnalysis(aiRes.data.data);
        } catch {
          setAnalysis(null);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load analysis for selected claim.');
      } finally {
        setLoadingDetail(false);
      }
    };
    loadDetail();
  }, [selectedId]);

  const handleReanalyze = async () => {
    if (!selectedId) return;
    setReanalyzing(true);
    try {
      await aiService.analyze(selectedId);
      const [reqRes, aiRes] = await Promise.all([
        preauthService.getById(selectedId),
        aiService.getAnalysis(selectedId),
      ]);
      setActiveRequest(reqRes.data.data);
      setAnalysis(aiRes.data.data);
    } catch (err) {
      console.error(err);
      setError('AI analysis failed.');
    } finally {
      setReanalyzing(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setSearchParams({ id });
  };

  const risk = analysis ? getRiskInfo(analysis.confidenceScore) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header with AI Disclaimer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 className="page-header" style={{ margin: 0 }}>AI Pre-Authorization Analysis</h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                background: '#f0fdfa',
                color: '#0f766e',
                border: '1px solid #99f6e4',
                borderRadius: 20,
                padding: '3px 10px',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <Sparkles size={13} /> Gemini 1.5 Pro NLP
            </span>
          </div>
          <p className="page-subheader" style={{ marginTop: 4 }}>
            Automated medical document extraction, policy criteria validation, and Bayesian confidence scoring
          </p>
        </div>

        {/* Legal Disclaimer Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#fffbeb',
            border: '1px solid #fde68a',
            padding: '8px 14px',
            borderRadius: 8,
            fontSize: 12,
            color: '#92400e',
            maxWidth: 380,
          }}
        >
          <Info size={16} style={{ flexShrink: 0 }} />
          <span>
            <strong>Decision Support Only:</strong> AI outputs are advisory. All coverage decisions must be made by a licensed insurer adjudicator.
          </span>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 16px', borderRadius: 8, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Main 2-column layout: Left Claim Picker, Right Deep Dive Analysis */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left column: Claim selector */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Select Claim</span>
            <span style={{ fontSize: 12, color: '#64748b' }}>{requests.length} available</span>
          </div>

          {loadingList ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading claims…</div>
          ) : (
            <div style={{ maxHeight: 620, overflowY: 'auto' }}>
              {requests.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No claims found.</div>
              )}
              {requests.map((r) => {
                const isSelected = r._id === selectedId;
                return (
                  <div
                    key={r._id}
                    onClick={() => handleSelect(r._id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f8fafc',
                      cursor: 'pointer',
                      background: isSelected ? '#f0fdfa' : 'transparent',
                      borderLeft: isSelected ? '4px solid #0f766e' : '4px solid transparent',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: isSelected ? '#0f766e' : '#0f172a' }}>
                        {r.requestId}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.treatmentDetails.procedureName}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginTop: 4 }}>
                      <span>{r.patientInfo?.name || 'Patient'}</span>
                      <span>{formatCurrency(r.requestedAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Deep-dive AI Analysis View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {loadingDetail ? (
            <div className="card" style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
              <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <div>Loading AI analysis details…</div>
            </div>
          ) : !activeRequest ? (
            <div className="card" style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              Select a claim on the left to view AI analysis.
            </div>
          ) : (
            <>
              {/* Claim Overview Header Bar */}
              <div
                className="card"
                style={{
                  background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
                  color: '#fff',
                  padding: '20px 24px',
                  borderRadius: 12,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.85, fontWeight: 600 }}>
                      Pre-Authorization Claim &bull; {activeRequest.requestId}
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 2px', color: '#fff' }}>
                      {activeRequest.treatmentDetails.procedureName}
                    </h2>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>
                      Patient: <strong style={{ color: '#fff' }}>{activeRequest.patientInfo?.name}</strong> &bull; Hospital: {activeRequest.treatmentDetails.hospitalName} &bull; Requested: {formatCurrency(activeRequest.requestedAmount)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={handleReanalyze}
                      disabled={reanalyzing}
                      style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: 'none' }}
                      title="Run Gemini analysis again"
                    >
                      {reanalyzing ? (
                        <><Loader2 size={13} className="animate-spin" /> Analyzing…</>
                      ) : (
                        <><RefreshCw size={13} /> Re-analyze with AI</>
                      )}
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/insurer/review/${activeRequest._id}`)}
                      style={{ background: '#fff', color: '#0f766e', fontWeight: 700 }}
                    >
                      Review & Decide <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {!analysis ? (
                <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                  <Brain size={40} color="#cbd5e1" style={{ margin: '0 auto 12px' }} />
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a' }}>No AI Analysis Record Found</div>
                  <p style={{ fontSize: 13, color: '#64748b', maxWidth: 400, margin: '8px auto 16px' }}>
                    This request has not yet been processed by the Gemini AI pre-authorization engine.
                  </p>
                  <button className="btn btn-primary" onClick={handleReanalyze} disabled={reanalyzing}>
                    {reanalyzing ? <><Loader2 size={15} className="animate-spin" /> Running Analysis…</> : <><Sparkles size={15} /> Run AI Analysis Now</>}
                  </button>
                </div>
              ) : (
                <>
                  {/* Gauge Cards & Recommendation Banner */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    {/* Confidence Score */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 12 }}>
                        AI Confidence Score
                      </div>
                      <ConfidenceGauge score={analysis.confidenceScore} size={130} />
                      <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: risk?.color }}>
                        {risk?.label}
                      </div>
                    </div>

                    {/* Policy Match Score */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 12 }}>
                        Policy Match Score
                      </div>
                      <ConfidenceGauge score={analysis.policyMatchScore} size={130} />
                      <div style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: '#0f766e' }}>
                        {activeRequest.insuranceDetails.provider}
                      </div>
                    </div>

                    {/* Recommendation Box */}
                    <div
                      className="card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        padding: 20,
                        background: analysis.recommendation.toLowerCase().includes('approve')
                          ? '#f0fdf4'
                          : analysis.recommendation.toLowerCase().includes('review')
                          ? '#fffbeb'
                          : '#fef2f2',
                        borderLeft: `4px solid ${
                          analysis.recommendation.toLowerCase().includes('approve')
                            ? '#16a34a'
                            : analysis.recommendation.toLowerCase().includes('review')
                            ? '#d97706'
                            : '#dc2626'
                        }`,
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em' }}>
                        AI Recommendation
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '6px 0' }}>
                        {analysis.recommendation}
                      </div>
                      <p style={{ fontSize: 12, color: '#475569', margin: 0, lineHeight: 1.4 }}>
                        {analysis.policyMatch}
                      </p>
                    </div>
                  </div>

                  {/* Clinical & Document Summary */}
                  <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
                      <Brain size={18} color="#0f766e" />
                      Clinical & Policy Assessment
                    </div>
                    <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.6, background: '#f8fafc', padding: '14px 16px', borderRadius: 8, margin: 0 }}>
                      {analysis.summary}
                    </p>
                  </div>

                  {/* Flags & Missing Documents */}
                  {(analysis.missingDocuments.length > 0 || analysis.flags.length > 0) && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                      {analysis.missingDocuments.length > 0 && (
                        <div className="card" style={{ borderLeft: '4px solid #d97706', background: '#fffbeb' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 10 }}>
                            <AlertTriangle size={16} /> Missing Required Documents
                          </div>
                          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#78350f' }}>
                            {analysis.missingDocuments.map((doc, i) => (
                              <li key={i} style={{ marginBottom: 4 }}>{doc}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {analysis.flags.length > 0 && (
                        <div className="card" style={{ borderLeft: '4px solid #dc2626', background: '#fef2f2' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 700, color: '#991b1b', marginBottom: 10 }}>
                            <AlertCircle size={16} /> Attention Flags
                          </div>
                          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#7f1d1d' }}>
                            {analysis.flags.map((flag, i) => (
                              <li key={i} style={{ marginBottom: 4 }}>{flag}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pipeline Checklist */}
                  <div className="card">
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>
                      AI Analysis Pipeline Steps
                    </div>
                    <AIPipeline pipeline={analysis.pipeline} />
                  </div>

                  {/* Uploaded Documents List */}
                  <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>
                        Attached Documents ({documents.length})
                      </div>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate('/insurer/documents')}
                      >
                        Document Management &rarr;
                      </button>
                    </div>

                    {documents.length === 0 ? (
                      <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: 20 }}>
                        No documents attached to this claim.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {documents.map((doc) => (
                          <div
                            key={doc._id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 14px',
                              background: '#f8fafc',
                              border: '1px solid #f1f5f9',
                              borderRadius: 6,
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <FileText size={18} color="#0f766e" />
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{doc.originalName}</div>
                                <div style={{ fontSize: 11, color: '#64748b' }}>
                                  Type: {doc.documentType.replace(/_/g, ' ')} &bull; Status: <strong>{doc.verificationStatus}</strong>
                                </div>
                              </div>
                            </div>
                            <a
                              href={`http://localhost:5000/${doc.filePath}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-secondary btn-sm"
                            >
                              Download
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
