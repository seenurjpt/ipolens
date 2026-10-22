import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Glass } from '../glass/glass';
import { Text } from './text';

/** A titled glass card used to group sections on detail screens. */
export function Card({ title, right, children }: { title?: string; right?: ReactNode; children: ReactNode }) {
  return (
    <Glass className="gap-3 p-4">
      {title ? (
        <View className="flex-row items-center justify-between">
          <Text variant="title">{title}</Text>
          {right}
        </View>
      ) : null}
      {children}
    </Glass>
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
