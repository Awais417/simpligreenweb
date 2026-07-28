'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { User } from '../../lib/types';
import { Modal } from '../ui/Modal';
import { Input, Select, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

export function CreateJobModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');
  const [qaId, setQaId] = useState('');
  const [managers, setManagers] = useState<User[]>([]);
  const [qaUsers, setQaUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setTitle('');
      setAddress('');
      setDescription('');
      setManagerId('');
      setQaId('');
      setError('');
      try {
        const [m, q] = await Promise.all([api.admin.listUsers('manager'), api.admin.listUsers('qa')]);
        setManagers(m);
        setQaUsers(q);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load managers/QA');
      }
    })();
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.admin.createJob({
        title: title.trim(),
        address: address.trim() || undefined,
        description: description.trim() || undefined,
        managerId,
        qaId,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Job" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert kind="error">{error}</Alert>}

        <Input
          label="Job title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Rooftop Solar Installation"
        />
        <Input
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Site address (optional)"
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Details about this job (optional)"
        />

        <Select label="Manager" required value={managerId} onChange={(e) => setManagerId(e.target.value)}>
          <option value="">Select a manager…</option>
          {managers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>

        <Select label="QA reviewer" required value={qaId} onChange={(e) => setQaId(e.target.value)}>
          <option value="">Select a QA reviewer…</option>
          {qaUsers.map((q) => (
            <option key={q.id} value={q.id}>
              {q.name}
            </option>
          ))}
        </Select>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving} disabled={!managerId || !qaId}>
            Create job
          </Button>
        </div>
      </form>
    </Modal>
  );
}
