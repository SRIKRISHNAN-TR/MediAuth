import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';
import type { PipelineStep } from '../../types';

interface Props { pipeline: PipelineStep[]; }

const iconMap = {
  completed: <CheckCircle size={16} color="#16a34a" />,
  warning: <AlertCircle size={16} color="#d97706" />,
  failed: <XCircle size={16} color="#dc2626" />,
  pending: <Clock size={16} color="#94a3b8" />,
};

export const AIPipeline: React.FC<Props> = ({ pipeline }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
    {pipeline.map((step, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ marginTop: 1, flexShrink: 0 }}>{iconMap[step.status]}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{step.step}</div>
          {step.note && <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{step.note}</div>}
        </div>
      </div>
    ))}
  </div>
);
