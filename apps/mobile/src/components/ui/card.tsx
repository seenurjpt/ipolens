import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from './text';

/** A titled white card used to group sections on detail screens. */
export function Card({ title, right, children }: { title?: string; right?: ReactNode; children: ReactNode }) {
  return (
    <View className="gap-3 rounded-2xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark">
      {title ? (
        <View className="flex-row items-center justify-between">
          <Text variant="title">{title}</Text>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  );
}

/** Label on the left, value on the right. */
export function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <View className="flex-row items-start justify-between gap-4">
      <Text variant="caption" className="pt-px text-sm">
        {label}
      </Text>
      {typeof value === 'string' ? (
        <Text variant="label" className="shrink text-right">
          {value}
        </Text>
      ) : (
        value
      )}
    </View>
  );
}
