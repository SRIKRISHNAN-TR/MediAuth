import React, { useEffect, useState } from 'react';
import { preauthService, documentService } from '../../services/services';
import type { PreAuthRequest, MedDocument } from '../../types';
import { FileText, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDate, formatFileSize } from '../../utils/helpers';

export const InsurerDocuments: React.FC = () => {
  const [requests, setRequests] = useState<PreAuthRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<PreAuthRequest | null>(null);
  const [docs, setDocs] = useState<MedDocument[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [updatingDoc, setUpdatingDoc] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    preauthService.getAll({ limit: '100' })
      .then((r) => setRequests(r.data.data.requests))
      .catch(console.error)
      .finally(() => setLoadingReqs(false));
  }, []);

  const loadDocs = async (req: PreAuthRequest) => {
    setSelectedReq(req);
    setLoadingDocs(true);
    try {
      const res = await documentService.getByRequest(req._id);
      setDocs(res.data.data);
    } catch { console.error('Failed to load docs'); }
    finally { setLoadingDocs(false); }
  };

  const handleVerify = async (docId: string, status: string) => {
    setUpdatingDoc(docId);
    try {
      await documentService.updateStatus(docId, status);
      setDocs((d) => d.map((x) => x._id === docId ? { ...x, verificationStatus: status as MedDocument['verificationStatus'] } : x));
    } catch { console.error('Failed to update'); }
    finally { setUpdatingDoc(null); }
  };

  const filtered = requests.filter((r) =>
    r.requestId.toLowerCase().includes(search.toLowerCase()) ||
    r.patientInfo.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-header">Document Verification</h1>
        <p className="page-subheader">Review and verify documents for pre-authorization claims</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
            <input
              className="form-input"
              placeholder="Search requests…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: 13 }}
            />
          </div>
          {loadingReqs ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No requests found</div>
          ) : (
            filtered.map((r) => (
              <div
                key={r._id}
                onClick={() => loadDocs(r)}
                style={{
                  padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f8fafc',
                  background: selectedReq?._id === r._id ? '#f0fdfa' : 'transparent',
                  borderLeft: selectedReq?._id === r._id ? '3px solid #0f766e' : '3px solid transparent',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{r.requestId}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{r.patientInfo.name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{r.treatmentDetails.procedureName} · {formatDate(r.createdAt)}</div>
              </div>
            ))
          )}
        </div>

        {!selectedReq ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <FileText size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14, color: '#94a3b8' }}>Select a request to verify its documents</div>
          </div>
        ) : (
          <div className="card">
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedReq.requestId} — {selectedReq.patientInfo.name}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{selectedReq.treatmentDetails.procedureName}</div>
            </div>
            {loadingDocs ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
            ) : docs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 13 }}>No documents uploaded for this request</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {docs.map((doc) => (
                  <div key={doc._id} style={{
                    padding: '12px 14px', background: '#f8fafc', borderRadius: 10,
                    border: '1px solid #f1f5f9',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <FileText size={16} color="#64748b" />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.originalName}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{doc.documentType.replace(/_/g, ' ')} · {formatFileSize(doc.fileSize)} · {formatDate(doc.createdAt)}</div>
                      </div>
                      <span className={`badge badge-${doc.verificationStatus}`}>{doc.verificationStatus}</span>
                      <a href={`/uploads/${doc.fileName}`} target="_blank" rel="noreferrer" style={{ color: '#64748b' }}><Download size={14} /></a>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn btn-success btn-sm"
                        disabled={doc.verificationStatus === 'verified' || updatingDoc === doc._id}
                        onClick={() => handleVerify(doc._id, 'verified')}
                      >
                        <CheckCircle size={12} /> Verify
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={doc.verificationStatus === 'invalid' || updatingDoc === doc._id}
                        onClick={() => handleVerify(doc._id, 'invalid')}
                      >
                        <XCircle size={12} /> Reject
                      </button>
                      <button
                        className="btn btn-warning btn-sm"
                        disabled={doc.verificationStatus === 'requires_review' || updatingDoc === doc._id}
                        onClick={() => handleVerify(doc._id, 'requires_review')}
                      >
                        <AlertCircle size={12} /> Needs Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
