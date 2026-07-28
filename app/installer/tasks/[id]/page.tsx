'use client';

import { use, useEffect, useRef, useState } from 'react';
import { api } from '../../../lib/api';
import type { Task, TaskMedia } from '../../../lib/types';
import { usePageTitle } from '../../../components/layout/PageTitleContext';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Alert } from '../../../components/ui/Alert';
import { Spinner } from '../../../components/ui/Spinner';
import { TaskStatusBadge } from '../../../components/StatusBadge';
import { MediaGallery } from '../../../components/jobs/MediaGallery';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';

export default function InstallerTaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<'image' | 'certificate' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<TaskMedia | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  usePageTitle(task ? `Task ${task.sequenceNumber}` : 'Task Details');

  async function load() {
    setError('');
    try {
      setTask(await api.installer.getTask(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task');
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

  async function handleUpload(file: File, fileType: 'image' | 'certificate') {
    setUploading(fileType);
    setError('');
    try {
      await api.installer.uploadMedia(id, file, fileType);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setUploading(null);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      await api.installer.submitTask(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit task');
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

  if (error && !task) return <Alert kind="error">{error}</Alert>;
  if (!task) return null;

  const canEdit = task.status === 'pending' || task.status === 'rejected';
  const requiresCertificate = !!task.installer?.installerType?.requiresCertificate;
  const media = task.media ?? [];
  const hasImage = media.some((m) => m.fileType === 'image');
  const hasCertificate = media.some((m) => m.fileType === 'certificate');
  const canSubmit = canEdit && hasImage && (!requiresCertificate || hasCertificate);

  return (
    <div className="space-y-6 max-w-3xl">
      {error && <Alert kind="error">{error}</Alert>}

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Task {task.sequenceNumber} · {task.job?.title}
            </p>
            <p className="text-base font-medium text-gray-900 mt-1">{task.description}</p>
          </div>
          <TaskStatusBadge status={task.status} />
        </div>

        {task.managerComments && (
          <div className="mt-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-800">
            <span className="font-medium">Manager feedback: </span>
            {task.managerComments}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Photos &amp; Files</h3>
          {canEdit && (
            <div className="flex gap-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, 'image');
                  e.target.value = '';
                }}
              />
              <Button
                size="sm"
                variant="secondary"
                loading={uploading === 'image'}
                onClick={() => imageInputRef.current?.click()}
              >
                Upload Photo
              </Button>

              <input
                ref={certInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file, 'certificate');
                  e.target.value = '';
                }}
              />
              <Button
                size="sm"
                variant="secondary"
                loading={uploading === 'certificate'}
                onClick={() => certInputRef.current?.click()}
              >
                Upload Certificate
              </Button>
            </div>
          )}
        </div>

        {requiresCertificate && (
          <p className="text-xs text-gray-400 mb-3">
            Your installer type requires a certificate upload before this task can be submitted.
          </p>
        )}

        <MediaGallery media={media} onDelete={canEdit ? (m) => setDeleteTarget(m) : undefined} />
      </Card>

      {canEdit && (
        <div className="flex justify-end">
          <Button loading={submitting} disabled={!canSubmit} onClick={handleSubmit}>
            Submit for Review
          </Button>
        </div>
      )}
      {canEdit && !canSubmit && (
        <p className="text-xs text-gray-400 text-right -mt-4">
          Upload at least one photo{requiresCertificate ? ' and your certificate' : ''} before submitting.
        </p>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete file"
        message="Are you sure you want to remove this file?"
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await api.installer.deleteMedia(id, deleteTarget.id);
            await load();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete file');
          }
        }}
      />
    </div>
  );
}
