'use client';

import { use, useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import type { Job } from '../../../lib/types';
import { usePageTitle } from '../../../components/layout/PageTitleContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Spinner } from '../../../components/ui/Spinner';
import { JobHeaderCard } from '../../../components/jobs/JobHeaderCard';
import { QaReviewsList } from '../../../components/jobs/QaReviewsList';
import { TaskCard } from '../../../components/jobs/TaskCard';

export default function AdminJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  usePageTitle(job?.title ?? 'Job Details');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        setJob(await api.admin.getJob(id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load job');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function handleDownloadPdf() {
    setDownloading(true);
    try {
      const blob = await api.admin.downloadJobPdf(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `job-report-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} className="text-brand" />
      </div>
    );
  }

  if (error) return <Alert kind="error">{error}</Alert>;
  if (!job) return null;

  return (
    <div className="space-y-6">
      <JobHeaderCard
        job={job}
        actions={
          <Button variant="secondary" loading={downloading} onClick={handleDownloadPdf}>
            Download PDF Report
          </Button>
        }
      />

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Tasks ({job.tasks?.length ?? 0})</h3>
        {!job.tasks || job.tasks.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No tasks have been added to this job yet.</p>
        ) : (
          <div className="space-y-4">
            {job.tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </Card>

      <QaReviewsList reviews={job.qaReviews ?? []} />
    </div>
  );
}
