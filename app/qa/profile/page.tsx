'use client';

import { usePageTitle } from '../../components/layout/PageTitleContext';
import { ProfileForm } from '../../components/ProfileForm';

export default function QaProfilePage() {
  usePageTitle('Profile');
  return <ProfileForm />;
}
