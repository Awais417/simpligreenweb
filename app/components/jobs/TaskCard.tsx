import type { Task } from '../../lib/types';
import { TaskStatusBadge } from '../StatusBadge';
import { MediaGallery } from './MediaGallery';

export function TaskCard({ task, actions }: { task: Task; actions?: React.ReactNode }) {
  return (
    <div className="border border-gray-100 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Task {task.sequenceNumber}</p>
          <p className="text-sm font-medium text-gray-900 mt-1">{task.description}</p>
        </div>
        <TaskStatusBadge status={task.status} />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 mb-4">
        <span>
          Installer: <span className="text-gray-700 font-medium">{task.installer?.name ?? '—'}</span>
        </span>
        {task.installer?.installerType && (
          <span>
            Type: <span className="text-gray-700 font-medium">{task.installer.installerType.name}</span>
          </span>
        )}
      </div>

      <MediaGallery media={task.media ?? []} />

      {task.managerComments && (
        <div className="mt-4 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">
          <span className="font-medium text-gray-700">Manager comments: </span>
          {task.managerComments}
        </div>
      )}

      {actions && <div className="mt-4 flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
