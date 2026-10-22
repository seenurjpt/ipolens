import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, Switch, View } from 'react-native';

import { usePalette } from '@/lib/theme';

import { Text } from './text';

/** A labelled switch row for settings lists. */
export function ToggleRow({
  label,
  note,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  note?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  const palette = usePalette();
  return (
    <View className={`flex-row items-center gap-3 ${disabled ? 'opacity-50' : ''}`}>
      <View className="flex-1 gap-0.5">
        <Text variant="label">{label}</Text>
        {note ? <Text variant="caption">{note}</Text> : null}
      </View>
      <Switch
        accessibilityLabel={label}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        trackColor={{ true: palette.brand, false: palette.line }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

/** A tappable option with a check box. */
export function CheckRow({
  label,
  note,
  checked,
  onToggle,
}: {
  label: string;
  note?: string;
  checked: boolean;
  onToggle: () => void;
}) {
  const palette = usePalette();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      className="flex-row items-center gap-3 py-1 active:opacity-70">
      <MaterialCommunityIcons
        name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
        size={22}
        color={checked ? palette.brand : palette.muted}
      />
      <View className="flex-1">
        <Text variant="label">{label}</Text>
        {note ? <Text variant="caption">{note}</Text> : null}
      </View>
    </Pressable>
  );
}

/** A small selectable pill, used for quick picks like PAN labels and categories. */
export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`rounded-full border px-3 py-1.5 ${
        selected
          ? 'border-brand bg-brand-soft dark:border-brand-dark dark:bg-brand-soft-dark'
          : 'border-rim bg-canvas dark:border-rim-dark dark:bg-canvas-dark'
      }`}>
      <Text
        className={`font-sans-medium text-xs ${selected ? 'text-brand dark:text-brand-dark' : 'text-ink dark:text-ink-dark'}`}>
        {label}
      </Text>
    </Pressable>
  );
}

/** − n + stepper for whole numbers. */
export function Stepper({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label: string;
}) {
  const palette = usePalette();
  const button = (icon: 'minus' | 'plus', next: number, disabled: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${icon === 'minus' ? 'Fewer' : 'More'} ${label}`}
      disabled={disabled}
      onPress={() => onChange(next)}
      className={`h-10 w-10 items-center justify-center rounded-full border border-rim bg-strong dark:border-rim-dark dark:bg-strong-dark ${disabled ? 'opacity-40' : 'active:opacity-70'}`}>
      <MaterialCommunityIcons name={icon} size={18} color={palette.ink} />
    </Pressable>
  );
  return (
    <View className="flex-row items-center gap-3">
      {button('minus', value - 1, value <= min)}
      <Text accessibilityLabel={`${value} ${label}`} className="min-w-8 text-center font-sans-semibold text-lg">
        {value}
      </Text>
      {button('plus', value + 1, value >= max)}
    </View>
  );
}
