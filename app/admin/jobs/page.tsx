'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import type { Job } from '../../lib/types';
import { formatDate } from '../../lib/utils';
import { usePageTitle } from '../../components/layout/PageTitleContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { JobStatusBadge } from '../../components/StatusBadge';
import { CreateJobModal } from '../../components/admin/CreateJobModal';

export default function AdminJobsPage() {
  usePageTitle('Jobs');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setJobs(await api.admin.listJobs());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setShowCreate(true)}>+ Create Job</Button>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size={28} className="text-brand" />
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No jobs yet"
            description="Create a job and assign a manager and QA reviewer to get started."
            action={<Button onClick={() => setShowCreate(true)}>+ Create Job</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-6 py-3 font-medium">Job</th>
                  <th className="px-6 py-3 font-medium">Manager</th>
                  <th className="px-6 py-3 font-medium">QA</th>
                  <th className="px-6 py-3 font-medium">Tasks</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50/60">
                    <td className="px-6 py-3.5">
                      <Link href={`/admin/jobs/${job.id}`} className="font-medium text-gray-900 hover:text-brand">
                        {job.title}
                      </Link>
                      {job.address && <p className="text-xs text-gray-400 mt-0.5">{job.address}</p>}
                    </td>
                    <td className="px-6 py-3.5 text-gray-600">{job.manager?.name ?? '—'}</td>
                    <td className="px-6 py-3.5 text-gray-600">{job.qa?.name ?? '—'}</td>
                    <td className="px-6 py-3.5 text-gray-600">{job._count?.tasks ?? 0}</td>
                    <td className="px-6 py-3.5">
                      <JobStatusBadge status={job.status} />
                    </td>
                    <td className="px-6 py-3.5 text-gray-500">{formatDate(job.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <CreateJobModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={load} />
    </div>
  );
}
