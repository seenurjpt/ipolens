import { router } from 'expo-router';
import { ScrollView } from 'react-native';

import { PanForm } from '@/components/pan-form';

export default function AddPanScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      <PanForm onSaved={() => router.back()} />
    </ScrollView>
  );
}
