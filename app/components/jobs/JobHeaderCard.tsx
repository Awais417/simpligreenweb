import type { Job } from '../../lib/types';
import { formatDate } from '../../lib/utils';
import { Card } from '../ui/Card';
import { JobStatusBadge } from '../StatusBadge';

export function JobHeaderCard({ job, actions }: { job: Job; actions?: React.ReactNode }) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-bold text-gray-900">{job.title}</h2>
            <JobStatusBadge status={job.status} />
          </div>
          {job.address && <p className="text-sm text-gray-500">{job.address}</p>}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>

      {job.description && <p className="text-sm text-gray-600 mt-4">{job.description}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 text-sm">
        <div>
          <p className="text-xs text-gray-400 mb-1">Manager</p>
          <p className="font-medium text-gray-900">{job.manager?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">QA Reviewer</p>
          <p className="font-medium text-gray-900">{job.qa?.name ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Created</p>
          <p className="font-medium text-gray-900">{formatDate(job.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Completed</p>
          <p className="font-medium text-gray-900">{formatDate(job.completedAt)}</p>
        </div>
      </div>
    </Card>
  );
}
