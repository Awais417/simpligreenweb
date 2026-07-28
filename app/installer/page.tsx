'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';
import type { Task } from '../lib/types';
import { usePageTitle } from '../components/layout/PageTitleContext';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { TaskStatusBadge } from '../components/StatusBadge';

export default function InstallerTasksPage() {
  usePageTitle('My Tasks');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setTasks(await api.installer.listTasks());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} className="text-brand" />
      </div>
    );
  }

  if (error) return <Alert kind="error">{error}</Alert>;

  if (tasks.length === 0) {
    return (
      <Card>
        <EmptyState title="No tasks assigned" description="Tasks assigned to you by a manager will appear here." />
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <Link key={task.id} href={`/installer/tasks/${task.id}`}>
          <Card className="p-5 h-full hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Task {task.sequenceNumber}
              </p>
              <TaskStatusBadge status={task.status} />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{task.description}</p>
            <p className="text-xs text-gray-400">{task.job?.title}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
