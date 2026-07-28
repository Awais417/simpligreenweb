'use client';

import { usePageTitle } from '../../components/layout/PageTitleContext';
import { ProfileForm } from '../../components/ProfileForm';

export default function InstallerProfilePage() {
  usePageTitle('Profile');
  return <ProfileForm />;
}
