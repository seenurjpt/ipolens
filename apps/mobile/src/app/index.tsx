import { Redirect } from 'expo-router';

import { useAppStore } from '@/lib/store';

export default function Index() {
  const onboarded = useAppStore((s) => s.onboarded);
  return <Redirect href={onboarded ? '/home' : '/onboarding'} />;
}
