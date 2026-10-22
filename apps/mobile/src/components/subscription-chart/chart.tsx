import type { SubscriptionFigures } from '@ipolens/shared';
import { useFont } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { View } from 'react-native';
import { CartesianChart, Line } from 'victory-native';

import { formatDayTime, isSameIstDay } from '@/lib/format';
import { CATEGORY_COLORS, usePalette } from '@/lib/theme';

import { Text } from '../ui/text';

type SeriesKey = 'qib' | 'nii' | 'retail' | 'total';

const SERIES: { key: SeriesKey; label: string }[] = [
  { key: 'qib', label: 'QIB' },
  { key: 'nii', label: 'NII' },
  { key: 'retail', label: 'Retail' },
  { key: 'total', label: 'Total' },
];

export interface SubscriptionChartProps {
  history: SubscriptionFigures[];
}

/** Subscription multiple over time, one line per category. */
export default function SubscriptionChart({ history }: SubscriptionChartProps) {
  const palette = usePalette();
  const font = useFont(require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'), 10);

  const data = useMemo(
    // x is the snapshot's position, not its time, so the overnight gap between bidding days
    // does not show up as a long flat line.
    () => history.map((s, i) => ({ i, qib: s.qib, nii: s.nii, retail: s.retail, total: s.total })),
    [history],
  );
  const first = history[0];
  const last = history.at(-1);
  if (!first || !last || data.length < 2) return null;

  const singleDay = isSameIstDay(first.at, last.at);
  const xLabel = (i: number) => {
    const at = history[Math.round(i)]?.at;
    if (!at) return '';
    return singleDay ? formatDayTime(at).split(', ')[1]! : formatDayTime(at);
  };

  return (
    <View className="rounded-2xl border border-line bg-surface p-3 dark:border-line-dark dark:bg-surface-dark">
      <View style={{ height: 220 }}>
        <CartesianChart
          data={data}
          xKey="i"
          yKeys={SERIES.map((s) => s.key)}
          padding={{ left: 4, right: 8, top: 8, bottom: 4 }}
          domain={{ y: [0] }}
          xAxis={{ font, tickCount: 4, labelColor: palette.muted, lineColor: palette.line, formatXLabel: xLabel }}
          yAxis={[{ font, tickCount: 5, labelColor: palette.muted, lineColor: palette.line, formatYLabel: (v) => `${v}x` }]}>
          {({ points }) =>
            SERIES.map((s) => (
              <Line
                key={s.key}
                points={points[s.key]}
                color={CATEGORY_COLORS[s.key]}
                strokeWidth={s.key === 'total' ? 2.5 : 2}
                curveType="monotoneX"
              />
            ))
          }
        </CartesianChart>
      </View>
      <View className="mt-2 flex-row flex-wrap justify-center gap-x-4 gap-y-1">
        {SERIES.map((s) => (
          <View key={s.key} className="flex-row items-center gap-1.5">
            <View className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[s.key] }} />
            <Text variant="caption">{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
