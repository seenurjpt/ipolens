import { Pressable, View } from 'react-native';

import { Text } from './ui/text';

/** Glass track with a brighter glass pill on the selected option. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View
      accessibilityRole="tablist"
      className="flex-row rounded-full border border-rim bg-canvas p-1 dark:border-rim-dark dark:bg-canvas-dark">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            className={`flex-1 items-center rounded-full py-2 ${selected ? 'bg-strong dark:bg-strong-dark' : ''}`}>
            <Text
              className={`text-[13px] ${selected ? 'font-sans-semibold text-ink dark:text-ink-dark' : 'font-sans-medium text-muted dark:text-muted-dark'}`}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Small glass pill filters, e.g. All / Mainboard / SME. */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View className="flex-row gap-2">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            className={`rounded-full border px-3.5 py-1.5 ${
              selected
                ? 'border-brand/40 bg-brand-soft dark:border-brand-dark/40 dark:bg-brand-soft-dark'
                : 'border-rim bg-canvas dark:border-rim-dark dark:bg-canvas-dark'
            }`}>
            <Text
              className={`font-sans-medium text-xs ${selected ? 'text-brand dark:text-brand-dark' : 'text-muted dark:text-muted-dark'}`}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
