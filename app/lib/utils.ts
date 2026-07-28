import type { JobStatus, TaskStatus } from './types';

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  submitted_to_qa: 'Submitted to QA',
  approved: 'Approved',
  rejected: 'Rejected',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  locked: 'Locked',
  pending: 'Ready to Start',
  submitted: 'Submitted',
  approved: 'Approved',
  rejected: 'Rejected',
};

type BadgeTone = 'gray' | 'blue' | 'amber' | 'green' | 'red';

export const JOB_STATUS_TONE: Record<JobStatus, BadgeTone> = {
  pending: 'gray',
  in_progress: 'blue',
  submitted_to_qa: 'amber',
  approved: 'green',
  rejected: 'red',
};

export const TASK_STATUS_TONE: Record<TaskStatus, BadgeTone> = {
  locked: 'gray',
  pending: 'blue',
  submitted: 'amber',
  approved: 'green',
  rejected: 'red',
};

// The web portal is admin/QA only — managers and installers use the mobile app.
export const WEB_ALLOWED_ROLES: readonly string[] = ['admin', 'qa'];

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  installer: 'Installer',
  qa: 'QA',
};
