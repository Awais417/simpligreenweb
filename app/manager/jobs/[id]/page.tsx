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
import { CreateTaskModal } from '../../../components/manager/CreateTaskModal';
import { RejectTaskModal } from '../../../components/manager/RejectTaskModal';

export default function ManagerJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [rejectTaskId, setRejectTaskId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  usePageTitle(job?.title ?? 'Job Details');

  async function load() {
    setError('');
    try {
      setJob(await api.manager.getJob(id));
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

  async function handleApprove(taskId: string) {
    setApprovingId(taskId);
    setError('');
    try {
      await api.manager.approveTask(taskId);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve task');
    } finally {
      setApprovingId(null);
    }
  }

  async function handleSubmitToQA() {
    setSubmitting(true);
    setError('');
    try {
      await api.manager.submitJobToQA(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit job to QA');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={28} className="text-brand" />
      </div>
    );
  }

  if (error && !job) return <Alert kind="error">{error}</Alert>;
  if (!job) return null;

  const tasks = job.tasks ?? [];
  const nextSequenceNumber = tasks.length === 0 ? 1 : Math.max(...tasks.map((t) => t.sequenceNumber)) + 1;
  const canSubmitToQA = tasks.length > 0 && tasks.every((t) => t.status === 'approved') && job.status !== 'approved';

  return (
    <div className="space-y-6">
      {error && <Alert kind="error">{error}</Alert>}

      <JobHeaderCard
        job={job}
        actions={
          job.status !== 'approved' ? (
            <Button loading={submitting} disabled={!canSubmitToQA} onClick={handleSubmitToQA}>
              Submit to QA
            </Button>
          ) : undefined
        }
      />

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Tasks ({tasks.length})</h3>
          {job.status !== 'approved' && (
            <Button size="sm" variant="secondary" onClick={() => setShowCreateTask(true)}>
              + Add Task
            </Button>
          )}
        </div>

        {tasks.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No tasks yet. Add the first task to get started.</p>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                actions={
                  task.status === 'submitted' ? (
                    <>
                      <Button size="sm" loading={approvingId === task.id} onClick={() => handleApprove(task.id)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => setRejectTaskId(task.id)}>
                        Reject
                      </Button>
                    </>
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </Card>

      <QaReviewsList reviews={job.qaReviews ?? []} />

      <CreateTaskModal
        open={showCreateTask}
        onClose={() => setShowCreateTask(false)}
        onCreated={load}
        jobId={id}
        nextSequenceNumber={nextSequenceNumber}
      />

      <RejectTaskModal
        open={!!rejectTaskId}
        onClose={() => setRejectTaskId(null)}
        onRejected={load}
        taskId={rejectTaskId}
      />
    </div>
  );
}
