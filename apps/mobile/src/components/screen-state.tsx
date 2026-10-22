import { ActivityIndicator, View } from 'react-native';

import { usePalette } from '@/lib/theme';

import { Glass } from './glass/glass';
import { Button } from './ui/button';
import { Text } from './ui/text';

export function Loading() {
  const palette = usePalette();
  return (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator color={palette.brand} />
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-16">
      <Glass className="w-full max-w-sm items-center gap-3 p-6">
        <Text variant="title">Couldn&apos;t load this</Text>
        <Text variant="caption" className="text-center">
          {message ?? 'Check your connection and try again.'}
        </Text>
        {onRetry ? <Button label="Try again" onPress={onRetry} className="mt-1 self-stretch" /> : null}
      </Glass>
    </View>
  );
}

export function Empty({ title, note }: { title: string; note?: string }) {
  return (
    <View className="items-center justify-center gap-1 px-8 py-16">
      <Text variant="title">{title}</Text>
      {note ? (
        <Text variant="caption" className="text-center">
          {note}
        </Text>
      ) : null}
    </View>
  );
}
