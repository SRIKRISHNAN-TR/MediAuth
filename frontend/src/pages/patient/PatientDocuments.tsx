import React, { useEffect, useState } from 'react';
import { preauthService, documentService } from '../../services/services';
import type { PreAuthRequest, MedDocument } from '../../types';
import { FileText, Download } from 'lucide-react';
import { formatDate, formatFileSize } from '../../utils/helpers';

export const PatientDocuments: React.FC = () => {
  const [requests, setRequests] = useState<PreAuthRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<PreAuthRequest | null>(null);
  const [docs, setDocs] = useState<MedDocument[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-header">My Documents</h1>
        <p className="page-subheader">View documents attached to your claims</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, alignItems: 'start' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, fontSize: 13, color: '#64748b' }}>
            My Claims
          </div>
          {loadingReqs ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
          ) : requests.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No claims yet</div>
          ) : (
            requests.map((r) => (
              <div
                key={r._id}
                onClick={() => loadDocs(r)}
                style={{
                  padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid #f8fafc',
                  background: selectedReq?._id === r._id ? '#f5f3ff' : 'transparent',
                  borderLeft: selectedReq?._id === r._id ? '3px solid #7c3aed' : '3px solid transparent',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{r.requestId}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{r.treatmentDetails.procedureName}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{formatDate(r.createdAt)}</div>
              </div>
            ))
          )}
        </div>

        {!selectedReq ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <FileText size={40} color="#e2e8f0" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 14, color: '#94a3b8' }}>Select a claim to view its documents</div>
          </div>
        ) : (
          <div className="card">
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{selectedReq.requestId}</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{selectedReq.treatmentDetails.procedureName}</div>
            </div>
            {loadingDocs ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>Loading…</div>
            ) : docs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: 13 }}>No documents for this claim</div>
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
                    <a href={`/uploads/${doc.fileName}`} target="_blank" rel="noreferrer" style={{ color: '#64748b' }}><Download size={14} /></a>
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
