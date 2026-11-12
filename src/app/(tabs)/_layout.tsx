import { Redirect } from 'expo-router';

import AppTabs from '@/components/app-tabs';
import { useProfile } from '@/data/profile-store';

export default function TabsLayout() {
  const profile = useProfile();
  if (!profile) return <Redirect href="/onboarding" />;
  return <AppTabs />;
}
