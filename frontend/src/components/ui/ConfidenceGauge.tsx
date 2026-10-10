import React from 'react';
import { getConfidenceColor } from '../../utils/helpers';

interface Props {
  score: number;
  size?: number;
  label?: string;
}

export const ConfidenceGauge: React.FC<Props> = ({ score, size = 80, label = 'Confidence' }) => {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const fillRatio = score / 100;
  const dashOffset = circumference * (1 - fillRatio);
  const color = getConfidenceColor(score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={8} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={circumference} strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 0.5s' }}
        />
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
          fill="#0f172a" fontSize={size * 0.22} fontWeight="700">{score}%</text>
      </svg>
      <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</span>
    </div>
  );
};
