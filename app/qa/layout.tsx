'use client';

import { RoleLayout } from '../components/layout/RoleLayout';

export default function QaLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleLayout role="qa" defaultTitle="Jobs">
      {children}
    </RoleLayout>
  );
}
