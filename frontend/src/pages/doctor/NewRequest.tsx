import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { preauthService } from '../../services/services';
import { Loader2, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

type Step = 1 | 2 | 3 | 4;

interface FormData {
  // Patient Info
  patientName: string;
  patientDob: string;
  patientGender: string;
  patientPhone: string;
  patientIdRef: string;
  // Treatment
  procedureName: string;
  cptCode: string;
  diagnosisCode: string;
  icdCode: string;
  description: string;
  hospitalName: string;
  estimatedDate: string;
  // Insurance
  provider: string;
  plan: string;
  policyNumber: string;
  requestedAmount: string;
}

const INITIAL: FormData = {
  patientName: '', patientDob: '', patientGender: '', patientPhone: '', patientIdRef: '',
  procedureName: '', cptCode: '', diagnosisCode: '', icdCode: '', description: '', hospitalName: '', estimatedDate: '',
  provider: '', plan: '', policyNumber: '', requestedAmount: '',
};

const STEPS = ['Patient Info', 'Treatment Details', 'Insurance Info', 'Review & Submit'];

export const NewRequest: React.FC = () => {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<{ _id: string; requestId: string } | null>(null);
  const navigate = useNavigate();

  const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (saveAsDraft: boolean) => {
    setError(''); setLoading(true);
    try {
      const payload = {
        patientInfo: {
          name: form.patientName,
          dateOfBirth: form.patientDob || undefined,
          gender: form.patientGender || undefined,
          phone: form.patientPhone || undefined,
          patientIdRef: form.patientIdRef || undefined,
        },
        treatmentDetails: {
          procedureName: form.procedureName,
          cptCode: form.cptCode || undefined,
          diagnosisCode: form.diagnosisCode || undefined,
          icdCode: form.icdCode || undefined,
          description: form.description || undefined,
          hospitalName: form.hospitalName,
          estimatedDate: form.estimatedDate || undefined,
        },
        insuranceDetails: {
          provider: form.provider,
          plan: form.plan || undefined,
          policyNumber: form.policyNumber || undefined,
        },
        requestedAmount: parseFloat(form.requestedAmount),
        status: 'draft',
      };
      const res = await preauthService.create(payload as never);
      const newReq = res.data.data;
      setCreated(newReq);
      if (!saveAsDraft) {
        await preauthService.submit(newReq._id);
      }
      setStep(4 as Step);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(msg || 'Failed to create request');
    } finally { setLoading(false); }
  };

  if (step === 4 && created) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle size={32} color="#16a34a" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>Request Created!</h2>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>Request ID: <strong style={{ color: '#2563eb' }}>{created.requestId}</strong></p>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="btn btn-secondary" onClick={() => navigate('/doctor/my-requests')}>View All Requests</button>
          <button className="btn btn-primary" onClick={() => navigate(`/doctor/request/${created._id}`)}>View This Request</button>
        </div>
      </div>
    );
  }

  const currentStepNum = step as number;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 className="page-header">New Pre-Authorization Request</h1>
        <p className="page-subheader">Step {currentStepNum} of 3 — {STEPS[currentStepNum - 1]}</p>
      </div>

      {/* Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 8 }}>
        {[1, 2, 3].map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={`step-circle ${s < currentStepNum ? 'completed' : s === currentStepNum ? 'active' : 'pending'}`}>
                {s < currentStepNum ? '✓' : s}
              </div>
              <span className={`step-label ${s < currentStepNum ? 'completed' : s === currentStepNum ? 'active' : ''}`} style={{ marginTop: 4, fontSize: 11 }}>
                {STEPS[i]}
              </span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: s < currentStepNum ? '#2563eb' : '#e2e8f0', margin: '0 4px', marginBottom: 20 }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Form card */}
      <div className="card" style={{ maxWidth: 640 }}>
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>{error}</div>}

        {/* Step 1: Patient Info */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontWeight: 600, fontSize: 15, margin: '0 0 4px' }}>Patient Information</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Patient Full Name *</label>
                <input className="form-input" placeholder="James Patterson" value={form.patientName} onChange={set('patientName')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Patient ID</label>
                <input className="form-input" placeholder="PT-00001" value={form.patientIdRef} onChange={set('patientIdRef')} />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input className="form-input" type="date" value={form.patientDob} onChange={set('patientDob')} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-input" value={form.patientGender} onChange={set('patientGender')}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+1 555-0100" value={form.patientPhone} onChange={set('patientPhone')} />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Treatment Details */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontWeight: 600, fontSize: 15, margin: '0 0 4px' }}>Treatment Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Procedure Name *</label>
                <input className="form-input" placeholder="Cardiac Bypass Surgery" value={form.procedureName} onChange={set('procedureName')} required />
              </div>
              <div className="form-group">
                <label className="form-label">CPT Code</label>
                <input className="form-input" placeholder="33533" value={form.cptCode} onChange={set('cptCode')} />
              </div>
              <div className="form-group">
                <label className="form-label">Diagnosis Code</label>
                <input className="form-input" placeholder="I25.10" value={form.diagnosisCode} onChange={set('diagnosisCode')} />
              </div>
              <div className="form-group">
                <label className="form-label">ICD Code</label>
                <input className="form-input" placeholder="ICD-10" value={form.icdCode} onChange={set('icdCode')} />
              </div>
              <div className="form-group">
                <label className="form-label">Estimated Date</label>
                <input className="form-input" type="date" value={form.estimatedDate} onChange={set('estimatedDate')} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Hospital / Facility *</label>
                <input className="form-input" placeholder="City General Hospital" value={form.hospitalName} onChange={set('hospitalName')} required />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Clinical Description</label>
                <textarea className="form-input" rows={3} placeholder="Brief clinical justification…" value={form.description} onChange={set('description')} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Insurance */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <p style={{ fontWeight: 600, fontSize: 15, margin: '0 0 4px' }}>Insurance Details</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Insurance Provider *</label>
                <input className="form-input" placeholder="BlueCross BlueShield" value={form.provider} onChange={set('provider')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Plan</label>
                <input className="form-input" placeholder="Gold PPO" value={form.plan} onChange={set('plan')} />
              </div>
              <div className="form-group">
                <label className="form-label">Policy Number</label>
                <input className="form-input" placeholder="BCB-123456" value={form.policyNumber} onChange={set('policyNumber')} />
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Requested Amount (USD) *</label>
                <input className="form-input" type="number" min="0" placeholder="25000" value={form.requestedAmount} onChange={set('requestedAmount')} required />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'space-between' }}>
          <div>
            {currentStepNum > 1 && (
              <button className="btn btn-secondary" onClick={() => setStep((s) => (s - 1) as Step)}>
                <ChevronLeft size={15} /> Back
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {step === 3 && (
              <button className="btn btn-secondary" onClick={() => handleSubmit(true)} disabled={loading}>
                Save as Draft
              </button>
            )}
            {step < 3 ? (
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (step === 1 && !form.patientName) return;
                  if (step === 2 && (!form.procedureName || !form.hospitalName)) return;
                  setStep((s) => (s + 1) as Step);
                }}
              >
                Continue <ChevronRight size={15} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => handleSubmit(false)} disabled={loading}>
                {loading ? <><Loader2 size={15} className="animate-spin" /> Submitting…</> : 'Submit Request'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
