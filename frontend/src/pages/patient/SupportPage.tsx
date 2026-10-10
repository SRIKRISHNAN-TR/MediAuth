import React, { useState } from 'react';
import {
  HelpCircle, Phone, Mail, AlertTriangle, Send,
  ChevronDown, ChevronUp, CheckCircle2, ShieldQuestion, LifeBuoy
} from 'lucide-react';

export const SupportPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const faqs = [
    {
      q: 'What is a medical pre-authorization request?',
      a: 'Pre-authorization (prior authorization) is a requirement by your health insurance provider to review and confirm medical necessity for specific procedures, medications, or hospital services before they take place, ensuring coverage eligibility.',
    },
    {
      q: 'How long does the pre-authorization review take?',
      a: 'With MediAuth AI, automated clinical extraction and policy matching typically complete within minutes of submission. Insurer adjudicators typically render a decision within 24 to 48 hours for standard requests, or under 24 hours for urgent cases.',
    },
    {
      q: 'What should I do if my claim status is "Missing Documents"?',
      a: 'If documents are flagged as missing, your treating physician has received an instant notification to attach the required clinical records (e.g., MRI scan reports, specialist referral, or pathology notes). You can also view which documents are attached in your Documents tab.',
    },
    {
      q: 'What happens if my pre-authorization is rejected?',
      a: 'If a claim is rejected, the insurer provides a specific clinical rationale visible on your Claim Details page. Your doctor may file an expedited appeal, submit supplementary clinical evidence, or recommend an alternative covered treatment pathway.',
    },
    {
      q: 'Who determines the approved coverage amount?',
      a: 'The coverage amount is determined by your specific insurance policy agreement and contracted network rates with your hospital or surgical center.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setSubmitted(true);
    setSubject('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 860 }}>
      <div>
        <h1 className="page-header">Patient Support & Help Center</h1>
        <p className="page-subheader">Get assistance with your pre-authorizations, insurance claims, and platform guidance</p>
      </div>

      {/* Urgent Disclaimer Banner */}
      <div
        style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 10,
          padding: '16px 20px',
          display: 'flex',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <AlertTriangle size={24} color="#dc2626" style={{ flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#991b1b' }}>
            Medical Emergency Notice
          </div>
          <div style={{ fontSize: 13, color: '#7f1d1d', marginTop: 2 }}>
            If you are experiencing a life-threatening medical condition, acute distress, or an emergency, do not wait for pre-authorization. Call 911 or go to your nearest emergency department immediately.
          </div>
        </div>
      </div>

      {/* Contact Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Toll-Free Claims Helpline</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>1-800-555-AUTH</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Mon-Fri: 8am – 8pm EST</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Mail size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Email Care Team</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>support@mediauth.com</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Typical response: under 2 hrs</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LifeBuoy size={22} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Hospital Coordination</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>Care Navigator Desk</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Direct facility liaison</div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#0f172a' }}>
          <ShieldQuestion size={20} color="#7c3aed" />
          Frequently Asked Questions
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: isOpen ? '#faf5ff' : '#fff',
                }}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    color: isOpen ? '#7c3aed' : '#1e293b',
                  }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {isOpen && (
                  <div style={{ padding: '0 18px 16px', fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Inquiry Form */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 700, marginBottom: 16, color: '#0f172a' }}>
          <HelpCircle size={20} color="#7c3aed" />
          Send a Message to Support
        </div>

        {submitted ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f0fdf4', color: '#16a34a', padding: '14px 18px', borderRadius: 8, fontSize: 14 }}>
            <CheckCircle2 size={18} />
            Thank you! Your inquiry has been received. A care coordinator will follow up shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                className="form-input"
                placeholder="e.g. Question regarding Claim MA-2026-00124"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Message Details</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Describe your question or issue in detail…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary">
                <Send size={14} /> Send Message
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
