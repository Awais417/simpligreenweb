'use client';

import { RoleGuard } from '../RoleGuard';
import { PageTitleProvider } from './PageTitleContext';
import { DashboardShell } from './DashboardShell';
import type { Role } from '../../lib/types';

export function RoleLayout({
  role,
  defaultTitle,
  children,
}: {
  role: Role;
  defaultTitle: string;
  children: React.ReactNode;
}) {
  return (
    <RoleGuard role={role}>
      <PageTitleProvider defaultTitle={defaultTitle}>
        <DashboardShell role={role}>{children}</DashboardShell>
      </PageTitleProvider>
    </RoleGuard>
  );
}
