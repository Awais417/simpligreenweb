'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Modal } from '../ui/Modal';
import { Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

export function JobDecisionModal({
  open,
  onClose,
  onDecided,
  jobId,
  decision,
}: {
  open: boolean;
  onClose: () => void;
  onDecided: () => void;
  jobId: string | null;
  decision: 'approve' | 'reject';
}) {
  const [comments, setComments] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const isReject = decision === 'reject';

  useEffect(() => {
    if (!open) return;
    (async () => {
      setComments('');
      setError('');
    })();
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!jobId) return;
    setError('');
    setSaving(true);
    try {
      if (isReject) {
        await api.qa.rejectJob(jobId, comments.trim());
      } else {
        await api.qa.approveJob(jobId, comments.trim() || undefined);
      }
      onDecided();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit decision');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isReject ? 'Reject Job' : 'Approve Job'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert kind="error">{error}</Alert>}

        <Textarea
          label={isReject ? 'Rejection reason' : 'Comments (optional)'}
          required={isReject}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder={isReject ? 'Explain what needs to be fixed' : 'All tasks verified and fully compliant'}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant={isReject ? 'danger' : 'primary'} loading={saving} disabled={isReject && !comments.trim()}>
            {isReject ? 'Reject job' : 'Approve job'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
