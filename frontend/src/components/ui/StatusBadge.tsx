import React from 'react';
import type { PreAuthStatus } from '../../types';
import { statusLabel, statusBadgeClass } from '../../utils/helpers';

interface Props { status: PreAuthStatus; }

export const StatusBadge: React.FC<Props> = ({ status }) => (
  <span className={statusBadgeClass(status)}>{statusLabel[status]}</span>
);
