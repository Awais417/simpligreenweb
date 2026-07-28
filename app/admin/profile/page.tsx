'use client';

import { usePageTitle } from '../../components/layout/PageTitleContext';
import { ProfileForm } from '../../components/ProfileForm';

export default function AdminProfilePage() {
  usePageTitle('Profile');
  return <ProfileForm />;
}
