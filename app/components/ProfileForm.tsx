'use client';

import { useRef, useState } from 'react';
import { useAuth } from '../lib/auth-context';
import { api } from '../lib/api';
import { formatDate, ROLE_LABELS } from '../lib/utils';
import { Avatar } from './Avatar';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Alert } from './ui/Alert';

export function ProfileForm() {
  const { user, updateLocalUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) return null;

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!name.trim() || name.trim() === user!.name) return;
    setSaving(true);
    try {
      const updated = await api.auth.updateProfile({ name: name.trim() });
      updateLocalUser(updated);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setSuccess('');
    setUploading(true);
    try {
      const updated = await api.auth.updateProfile({ avatar: file });
      updateLocalUser(updated);
      setSuccess('Photo updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      {error && <Alert kind="error">{error}</Alert>}
      {success && <Alert kind="success">{success}</Alert>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center gap-5">
          <Avatar name={user.name} avatar={user.avatar} size={72} />
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Button variant="secondary" size="sm" loading={uploading} onClick={() => fileInputRef.current?.click()}>
              Change photo
            </Button>
            <p className="text-xs text-gray-400 mt-2">JPEG, PNG or WebP</p>
          </div>
        </div>

        <form onSubmit={handleSaveName} className="mt-8 space-y-5">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Button type="submit" loading={saving} disabled={!name.trim() || name.trim() === user.name}>
            Save changes
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Account details</h3>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div>
            <dt className="text-gray-400 mb-1">Email</dt>
            <dd className="text-gray-900 font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-gray-400 mb-1">Role</dt>
            <dd>
              <Badge tone="brand">{ROLE_LABELS[user.role]}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-gray-400 mb-1">Status</dt>
            <dd>
              <Badge tone={user.isActive ? 'green' : 'red'}>{user.isActive ? 'Active' : 'Suspended'}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-gray-400 mb-1">Member since</dt>
            <dd className="text-gray-900 font-medium">{formatDate(user.createdAt)}</dd>
          </div>
          {user.installerType && (
            <div>
              <dt className="text-gray-400 mb-1">Installer type</dt>
              <dd className="text-gray-900 font-medium">
                {user.installerType.name}
                {user.installerType.requiresCertificate && (
                  <span className="text-gray-400 font-normal"> · certificate required</span>
                )}
              </dd>
            </div>
          )}
        </dl>
        <p className="text-xs text-gray-400 mt-6">
          Need to change your password? Sign out and use{' '}
          <span className="font-medium text-gray-500">Forgot password</span> on the sign-in screen.
        </p>
      </div>
    </div>
  );
}
