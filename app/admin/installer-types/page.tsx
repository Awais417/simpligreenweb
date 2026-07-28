'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { InstallerType } from '../../lib/types';
import { formatDate } from '../../lib/utils';
import { usePageTitle } from '../../components/layout/PageTitleContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Spinner } from '../../components/ui/Spinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { InstallerTypeModal } from '../../components/admin/InstallerTypeModal';

export default function InstallerTypesPage() {
  usePageTitle('Installer Types');

  const [types, setTypes] = useState<InstallerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalType, setModalType] = useState<InstallerType | null | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<InstallerType | null>(null);

  async function load() {
    setLoading(true);
    setError('');
    try {
      setTypes(await api.admin.listInstallerTypes());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load installer types');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => setModalType(null)}>+ Add Installer Type</Button>
      </div>

      {error && <Alert kind="error">{error}</Alert>}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size={28} className="text-brand" />
          </div>
        ) : types.length === 0 ? (
          <EmptyState
            title="No installer types yet"
            description="Add categories like Roofers, Electricians, or Gas Engineers."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Certificate</th>
                  <th className="px-6 py-3 font-medium">Created</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {types.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/60">
                    <td className="px-6 py-3.5 font-medium text-gray-900">{t.name}</td>
                    <td className="px-6 py-3.5">
                      <Badge tone={t.requiresCertificate ? 'amber' : 'gray'}>
                        {t.requiresCertificate ? 'Required' : 'Not required'}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-gray-500">{formatDate(t.createdAt)}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setModalType(t)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteTarget(t)}
                        >
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

      <InstallerTypeModal
        open={modalType !== undefined}
        onClose={() => setModalType(undefined)}
        onSaved={load}
        installerType={modalType}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete installer type"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await api.admin.deleteInstallerType(deleteTarget.id);
          await load();
        }}
      />
    </div>
  );
}
