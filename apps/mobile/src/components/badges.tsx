import type { Board, IpoStatus } from '@ipolens/shared';
import { View } from 'react-native';

import { formatMultiple, formatPct } from '@/lib/format';

import { Text } from './ui/text';

const STATUS: Record<IpoStatus, { label: string; box: string; text: string }> = {
  UPCOMING: { label: 'Upcoming', box: 'bg-brand-soft dark:bg-brand-soft-dark', text: 'text-brand dark:text-brand-dark' },
  OPEN: { label: 'Open', box: 'bg-over-soft dark:bg-over-soft-dark', text: 'text-over dark:text-over-dark' },
  CLOSED: { label: 'Closed', box: 'bg-canvas dark:bg-canvas-dark', text: 'text-muted dark:text-muted-dark' },
  ALLOTMENT: { label: 'Allotment', box: 'bg-under-soft dark:bg-under-soft-dark', text: 'text-under dark:text-under-dark' },
  LISTED: { label: 'Listed', box: 'bg-canvas dark:bg-canvas-dark', text: 'text-ink dark:text-ink-dark' },
  WITHDRAWN: { label: 'Withdrawn', box: 'bg-canvas dark:bg-canvas-dark', text: 'text-loss dark:text-loss-dark' },
};

export function StatusChip({ status }: { status: IpoStatus }) {
  const s = STATUS[status];
  return (
    <View className={`rounded-full px-2 py-0.5 ${s.box}`}>
      <Text className={`font-sans-semibold text-[11px] ${s.text}`}>{s.label}</Text>
    </View>
  );
}

export function BoardTag({ board }: { board: Board }) {
  if (board !== 'SME') return null;
  return (
    <View className="rounded border border-line px-1.5 py-px dark:border-line-dark">
      <Text className="font-sans-semibold text-[10px] text-muted dark:text-muted-dark">SME</Text>
    </View>
  );
}

/** "12.4x", green when the category is fully subscribed, amber below 1x. */
export function MultipleText({ value, stale = false, className = '' }: { value: number; stale?: boolean; className?: string }) {
  const color = stale
    ? 'text-muted dark:text-muted-dark'
    : value >= 1
      ? 'text-over dark:text-over-dark'
      : 'text-under dark:text-under-dark';
  return <Text className={`font-sans-semibold ${color} ${className}`}>{formatMultiple(value)}</Text>;
}

export function GainText({ pct, className = '' }: { pct: number; className?: string }) {
  const color = pct >= 0 ? 'text-over dark:text-over-dark' : 'text-loss dark:text-loss-dark';
  return <Text className={`font-sans-semibold ${color} ${className}`}>{formatPct(pct)}</Text>;
}
