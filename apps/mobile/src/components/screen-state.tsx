import { ActivityIndicator, Pressable, View } from 'react-native';

import { usePalette } from '@/lib/theme';

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
    <View className="flex-1 items-center justify-center gap-3 px-8 py-16">
      <Text variant="title">Couldn&apos;t load this</Text>
      <Text variant="caption" className="text-center">
        {message ?? 'Check your connection and try again.'}
      </Text>
      {onRetry ? (
        <Pressable onPress={onRetry} className="rounded-full bg-brand px-5 py-2 active:opacity-80 dark:bg-brand-dark">
          <Text className="font-sans-semibold text-white dark:text-canvas-dark">Try again</Text>
        </Pressable>
      ) : null}
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
