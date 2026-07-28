'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { InstallerType } from '../../lib/types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

export function InstallerTypeModal({
  open,
  onClose,
  onSaved,
  installerType,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  installerType?: InstallerType | null;
}) {
  const isEdit = !!installerType;

  const [name, setName] = useState('');
  const [requiresCertificate, setRequiresCertificate] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setName(installerType?.name ?? '');
      setRequiresCertificate(installerType?.requiresCertificate ?? false);
      setError('');
    })();
  }, [open, installerType]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await api.admin.updateInstallerType(installerType!.id, { name: name.trim(), requiresCertificate });
      } else {
        await api.admin.createInstallerType({ name: name.trim(), requiresCertificate });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save installer type');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Installer Type' : 'Add Installer Type'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert kind="error">{error}</Alert>}

        <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Electricians" />

        <label className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={requiresCertificate}
            onChange={(e) => setRequiresCertificate(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-brand focus:ring-brand"
          />
          Requires certificate upload
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? 'Save changes' : 'Create type'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
