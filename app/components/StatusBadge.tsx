import { Badge } from './ui/Badge';
import { JOB_STATUS_LABELS, JOB_STATUS_TONE, TASK_STATUS_LABELS, TASK_STATUS_TONE } from '../lib/utils';
import type { JobStatus, TaskStatus } from '../lib/types';

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return <Badge tone={JOB_STATUS_TONE[status]}>{JOB_STATUS_LABELS[status]}</Badge>;
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge tone={TASK_STATUS_TONE[status]}>{TASK_STATUS_LABELS[status]}</Badge>;
}
