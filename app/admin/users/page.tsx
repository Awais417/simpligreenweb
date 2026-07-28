'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { InstallerType, Role, User } from '../../lib/types';
import { formatDate, ROLE_LABELS } from '../../lib/utils';
import { usePageTitle } from '../../components/layout/PageTitleContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Avatar } from '../../components/Avatar';
import { UserModal } from '../../components/admin/UserModal';

const FILTERS: { label: string; value: Role | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Admins', value: 'admin' },
  { label: 'Managers', value: 'manager' },
  { label: 'Installers', value: 'installer' },
  { label: 'QA', value: 'qa' },
];

export default function AdminUsersPage() {
  usePageTitle('Users');

  const [users, setUsers] = useState<User[]>([]);
  const [installerTypes, setInstallerTypes] = useState<InstallerType[]>([]);
  const [filter, setFilter] = useState<Role | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [modalUser, setModalUser] = useState<User | null | undefined>(undefined); // undefined = closed, null = create
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [u, t] = await Promise.all([
        api.admin.listUsers(filter === 'all' ? undefined : filter),
        api.admin.listInstallerTypes(),
      ]);
      setUsers(u);
      setInstallerTypes(t);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function handleToggleStatus(user: User) {
    setBusyId(user.id);
    try {
      await api.admin.updateUser(user.id, { isActive: !user.isActive });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer
                ${filter === f.value ? 'bg-brand text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Button onClick={() => setModalUser(null)}>+ Add User</Button>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size={28} className="text-brand" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="Try a different filter or add a new user." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Installer Type</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} avatar={u.avatar} size={32} />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge tone="brand">{ROLE_LABELS[u.role]}</Badge>
                    </td>
                    <td className="px-6 py-3.5 text-gray-600">{u.installerType?.name ?? '—'}</td>
                    <td className="px-6 py-3.5">
                      <Badge tone={u.isActive ? 'green' : 'red'}>{u.isActive ? 'Active' : 'Suspended'}</Badge>
                    </td>
                    <td className="px-6 py-3.5 text-gray-500">{formatDate(u.createdAt)}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setModalUser(u)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          loading={busyId === u.id}
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50" onClick={() => setDeleteTarget(u)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <UserModal
        open={modalUser !== undefined}
        onClose={() => setModalUser(undefined)}
        onSaved={load}
        installerTypes={installerTypes}
        user={modalUser}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete user"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This cannot be undone.`}
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await api.admin.deleteUser(deleteTarget.id);
          await load();
        }}
      />
    </div>
  );
}
