'use client';

import { usePageTitle } from '../../components/layout/PageTitleContext';
import { ProfileForm } from '../../components/ProfileForm';

export default function ManagerProfilePage() {
  usePageTitle('Profile');
  return <ProfileForm />;
}
