import type { PreAuthStatus } from '../types';

export const statusLabel: Record<PreAuthStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  ai_processing: 'AI Processing',
  missing_documents: 'Missing Documents',
  under_review: 'Under Review',
  additional_info_required: 'Info Required',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const statusBadgeClass = (status: PreAuthStatus): string => `badge badge-${status}`;

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export const getConfidenceColor = (score: number): string => {
  if (score >= 80) return '#16a34a';
  if (score >= 60) return '#d97706';
  return '#dc2626';
};

export const getRiskLevel = (score: number): 'low' | 'medium' | 'high' => {
  if (score >= 80) return 'low';
  if (score >= 60) return 'medium';
  return 'high';
};

export const getRiskInfo = (score: number): { level: 'low' | 'medium' | 'high'; label: string; color: string } => {
  if (score >= 80) return { level: 'low', label: 'Low Risk', color: '#16a34a' };
  if (score >= 60) return { level: 'medium', label: 'Medium Risk', color: '#d97706' };
  return { level: 'high', label: 'High Risk', color: '#dc2626' };
};

export const getInitials = (name: string): string =>
  name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

