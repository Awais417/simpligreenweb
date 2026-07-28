'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { User } from '../../lib/types';
import { Modal } from '../ui/Modal';
import { Input, Select, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

export function CreateTaskModal({
  open,
  onClose,
  onCreated,
  jobId,
  nextSequenceNumber,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  jobId: string;
  nextSequenceNumber: number;
}) {
  const [description, setDescription] = useState('');
  const [installerId, setInstallerId] = useState('');
  const [sequenceNumber, setSequenceNumber] = useState(nextSequenceNumber);
  const [installers, setInstallers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setDescription('');
      setInstallerId('');
      setSequenceNumber(nextSequenceNumber);
      setError('');
      try {
        setInstallers(await api.manager.listInstallers());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load installers');
      }
    })();
  }, [open, nextSequenceNumber]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.manager.createTask(jobId, {
        description: description.trim(),
        installerId,
        sequenceNumber,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Task">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert kind="error">{error}</Alert>}

        <Textarea
          label="Task description"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Install scaffolding on the north face"
        />

        <Select label="Installer" required value={installerId} onChange={(e) => setInstallerId(e.target.value)}>
          <option value="">Select an installer…</option>
          {installers.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
              {i.installerType ? ` — ${i.installerType.name}` : ''}
            </option>
          ))}
        </Select>

        <Input
          label="Sequence number"
          type="number"
          min={1}
          required
          value={sequenceNumber}
          onChange={(e) => setSequenceNumber(Number(e.target.value))}
          hint="Task 1 starts immediately; later numbers stay locked until the previous task is approved."
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} disabled={!installerId}>
            Add task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
