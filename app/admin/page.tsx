'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';
import type { InstallerType, Job, User } from '../lib/types';
import { formatDate } from '../lib/utils';
import { Card } from '../components/ui/Card';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { JobStatusBadge } from '../components/StatusBadge';
import { JobsIcon, TagIcon, UsersIcon } from '../components/layout/icons';

export default function AdminOverviewPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [installerTypes, setInstallerTypes] = useState<InstallerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [u, j, t] = await Promise.all([
          api.admin.listUsers(),
          api.admin.listJobs(),
          api.admin.listInstallerTypes(),
        ]);
        setUsers(u);
        setJobs(j);
        setInstallerTypes(t);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load overview');
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

  const activeJobs = jobs.filter((j) => j.status === 'in_progress').length;
  const pendingQa = jobs.filter((j) => j.status === 'submitted_to_qa').length;
  const completed = jobs.filter((j) => j.status === 'approved').length;
  const recentJobs = [...jobs].slice(0, 6);

  const roleCounts = ['admin', 'manager', 'installer', 'qa'].map((role) => ({
    role,
    count: users.filter((u) => u.role === role).length,
  }));

  const stats = [
    { label: 'Total Users', value: users.length, icon: UsersIcon, href: '/admin/users' },
    { label: 'Active Jobs', value: activeJobs, icon: JobsIcon, href: '/admin/jobs' },
    { label: 'Pending QA', value: pendingQa, icon: JobsIcon, href: '/admin/jobs' },
    { label: 'Installer Types', value: installerTypes.length, icon: TagIcon, href: '/admin/installer-types' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-brand" />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Recent Jobs</h3>
            <Link href="/admin/jobs" className="text-xs font-medium text-brand hover:underline">
              View all
            </Link>
          </div>
          {recentJobs.length === 0 ? (
            <EmptyState title="No jobs yet" description="Create your first job to get started." />
          ) : (
            <div className="divide-y divide-gray-100">
              {recentJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/admin/jobs/${job.id}`}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{job.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Manager: {job.manager?.name ?? '—'} · {formatDate(job.createdAt)}
                    </p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Team Breakdown</h3>
          <div className="space-y-3">
            {roleCounts.map(({ role, count }) => (
              <div key={role} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 capitalize">{role}</span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-600">Jobs completed</span>
            <span className="font-semibold text-gray-900">{completed}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
