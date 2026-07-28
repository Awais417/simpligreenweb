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
import { JobDecisionModal } from '../../../components/qa/JobDecisionModal';

export default function QaJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);

  usePageTitle(job?.title ?? 'Job Details');

  async function load() {
    setError('');
    try {
      setJob(await api.qa.getJob(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load job');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} className="text-brand" />
      </div>
    );
  }

  if (error && !job) return <Alert kind="error">{error}</Alert>;
  if (!job) return null;

  const canReview = job.status === 'submitted_to_qa';

  return (
    <div className="space-y-6">
      {error && <Alert kind="error">{error}</Alert>}

      <JobHeaderCard
        job={job}
        actions={
          canReview ? (
            <>
              <Button variant="secondary" onClick={() => setDecision('reject')}>
                Reject
              </Button>
              <Button onClick={() => setDecision('approve')}>Approve</Button>
            </>
          ) : undefined
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

      <JobDecisionModal
        open={!!decision}
        onClose={() => setDecision(null)}
        onDecided={load}
        jobId={id}
        decision={decision ?? 'approve'}
      />
    </div>
  );
}
