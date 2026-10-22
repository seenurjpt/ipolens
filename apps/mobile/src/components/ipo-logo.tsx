import { Image } from 'expo-image';
import { View } from 'react-native';

import { Text } from './ui/text';

const SIZES = { sm: { px: 40, box: 'h-10 w-10 rounded-xl' }, lg: { px: 56, box: 'h-14 w-14 rounded-2xl' } } as const;

/** Company logo, or its initials on a tinted tile when there is no logo. */
export function IpoLogo({ name, logoUrl, size = 'sm' }: { name: string; logoUrl?: string; size?: keyof typeof SIZES }) {
  const { px, box } = SIZES[size];
  if (logoUrl) {
    return <Image source={logoUrl} style={{ width: px, height: px, borderRadius: px / 4 }} contentFit="contain" />;
  }
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <View className={`${box} items-center justify-center bg-brand-soft dark:bg-brand-soft-dark`}>
      <Text className={`font-sans-bold text-brand dark:text-brand-dark ${size === 'lg' ? 'text-lg' : 'text-sm'}`}>
        {initials}
      </Text>
    </View>
  );
}
