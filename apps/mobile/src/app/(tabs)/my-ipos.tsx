import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { usePalette } from '@/lib/theme';

// Sign-in, saved PANs and applications arrive in Prompt 5.
export default function MyIposScreen() {
  const palette = usePalette();
  return (
    <View className="flex-1 items-center justify-center gap-3 px-10">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-soft dark:bg-brand-soft-dark">
        <MaterialCommunityIcons name="briefcase-outline" size={28} color={palette.brand} />
      </View>
      <Text variant="heading" className="text-center">
        Track your applications
      </Text>
      <Text variant="caption" className="text-center text-sm leading-5">
        Mark the IPOs you applied for, across your family&apos;s PANs, and see allotment and listing-day gains in one
        place. Sign-in is coming soon.
      </Text>
    </View>
  );
}
