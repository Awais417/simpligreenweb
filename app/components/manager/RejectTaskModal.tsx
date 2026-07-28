'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { User } from '../../lib/types';
import { Modal } from '../ui/Modal';
import { Select, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

export function RejectTaskModal({
  open,
  onClose,
  onRejected,
  taskId,
}: {
  open: boolean;
  onClose: () => void;
  onRejected: () => void;
  taskId: string | null;
}) {
  const [comments, setComments] = useState('');
  const [newInstallerId, setNewInstallerId] = useState('');
  const [installers, setInstallers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setComments('');
      setNewInstallerId('');
      setError('');
      try {
        setInstallers(await api.manager.listInstallers());
      } catch {
        // Reassignment is optional; ignore load failure here.
      }
    })();
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!taskId) return;
    setError('');
    setSaving(true);
    try {
      await api.manager.rejectTask(taskId, comments.trim(), newInstallerId || undefined);
      onRejected();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject task');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Reject Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert kind="error">{error}</Alert>}

        <Textarea
          label="Rejection reason"
          required
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Explain what needs to be redone"
        />

        <Select
          label="Reassign installer (optional)"
          value={newInstallerId}
          onChange={(e) => setNewInstallerId(e.target.value)}
        >
          <option value="">Keep current installer</option>
          {installers.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </Select>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" loading={saving} disabled={!comments.trim()}>
            Reject task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
