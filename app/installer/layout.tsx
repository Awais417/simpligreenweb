'use client';

import { RoleLayout } from '../components/layout/RoleLayout';

export default function InstallerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleLayout role="installer" defaultTitle="My Tasks">
      {children}
    </RoleLayout>
  );
}
