import { Pressable, View } from 'react-native';

import { Text } from './ui/text';

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
    <View accessibilityRole="tablist" className="flex-row rounded-xl bg-line/60 p-1 dark:bg-line-dark">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.value)}
            className={`flex-1 items-center rounded-lg py-1.5 ${selected ? 'bg-surface shadow-sm dark:bg-surface-dark' : ''}`}>
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

/** Small pill filters, e.g. All / Mainboard / SME. */
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
            className={`rounded-full border px-3 py-1 ${
              selected
                ? 'border-brand bg-brand-soft dark:border-brand-dark dark:bg-brand-soft-dark'
                : 'border-line bg-surface dark:border-line-dark dark:bg-surface-dark'
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
