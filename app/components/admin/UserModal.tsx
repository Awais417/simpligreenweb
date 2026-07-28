'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { InstallerType, Role, User } from '../../lib/types';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';

const ROLE_OPTIONS: Role[] = ['admin', 'manager', 'installer', 'qa'];

export function UserModal({
  open,
  onClose,
  onSaved,
  installerTypes,
  user,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  installerTypes: InstallerType[];
  user?: User | null;
}) {
  const isEdit = !!user;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('installer');
  const [installerTypeId, setInstallerTypeId] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setName(user?.name ?? '');
      setEmail(user?.email ?? '');
      setPassword('');
      setRole(user?.role ?? 'installer');
      setInstallerTypeId(user?.installerTypeId ?? '');
      setError('');
    })();
  }, [open, user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isEdit) {
        await api.admin.updateUser(user!.id, {
          name: name.trim(),
          email: email.trim(),
          ...(password ? { password } : {}),
          installerTypeId: role === 'installer' ? installerTypeId || null : null,
        });
      } else {
        await api.admin.createUser({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          ...(role === 'installer' && installerTypeId ? { installerTypeId } : {}),
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit User' : 'Add User'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert kind="error">{error}</Alert>}

        <Input label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="Email address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label={isEdit ? 'New password' : 'Password'}
          type="password"
          required={!isEdit}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isEdit ? 'Leave blank to keep current password' : 'At least 8 characters'}
          hint={isEdit ? undefined : 'Must include uppercase, lowercase and a number or symbol'}
        />

        {isEdit ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <p className="text-sm text-gray-500 px-4 py-2.5 bg-gray-50 rounded-xl capitalize">{user!.role}</p>
            <p className="text-xs text-gray-400 mt-1">Role cannot be changed after account creation.</p>
          </div>
        ) : (
          <Select label="Role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r} className="capitalize">
                {r}
              </option>
            ))}
          </Select>
        )}

        {role === 'installer' && (
          <Select
            label="Installer type"
            value={installerTypeId}
            onChange={(e) => setInstallerTypeId(e.target.value)}
          >
            <option value="">Select a type…</option>
            {installerTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
                {t.requiresCertificate ? ' (certificate required)' : ''}
              </option>
            ))}
          </Select>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" loading={saving}>
            {isEdit ? 'Save changes' : 'Create user'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
