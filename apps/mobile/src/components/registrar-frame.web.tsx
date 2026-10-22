import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Linking, View } from 'react-native';

import { usePalette } from '@/lib/theme';

import type { RegistrarFrameProps } from './registrar-frame';
import { Button } from './ui/button';
import { Text } from './ui/text';

// Registrar sites refuse to load inside other pages, so on web the page opens in a new tab.
export function RegistrarFrame({ url }: RegistrarFrameProps) {
  const palette = usePalette();
  return (
    <View className="flex-1 items-center justify-center gap-4 px-8">
      <MaterialCommunityIcons name="open-in-new" size={32} color={palette.brand} />
      <Text variant="caption" className="max-w-sm text-center text-sm leading-5">
        The registrar&apos;s page opens in a new tab. Come back here to record your result.
      </Text>
      <Button label="Open the registrar's page" onPress={() => void Linking.openURL(url)} className="self-stretch" />
    </View>
  );
}
