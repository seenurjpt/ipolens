import { router } from 'expo-router';
import { ScrollView } from 'react-native';

import { useContentInsets } from '@/components/glass/layout';
import { PanForm } from '@/components/pan-form';

export default function AddPanScreen() {
  const insets = useContentInsets();
  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top, paddingBottom: insets.bottom }}
      keyboardShouldPersistTaps="handled">
      <PanForm onSaved={() => router.back()} />
    </ScrollView>
  );
}
