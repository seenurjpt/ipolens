import { SCORE_WEIGHTS, type AiReport } from '@ipolens/shared';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { usePalette } from '@/lib/theme';

import { Text } from './ui/text';

/** 0–100 analysis score as a ring. Colour is the brand colour, not a good/bad signal. */
export function ScoreRing({ total, size = 96 }: { total: number; size?: number }) {
  const palette = usePalette();
  const stroke = size / 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={palette.line} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={palette.brand}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${(circumference * total) / 100} ${circumference}`}
        />
      </Svg>
      <Text className="font-sans-bold text-2xl">{total}</Text>
      <Text variant="caption" className="-mt-1">
        of 100
      </Text>
    </View>
  );
}

const LABELS: Record<keyof typeof SCORE_WEIGHTS, string> = {
  growth: 'Growth',
  profitability: 'Profitability',
  balanceSheet: 'Balance sheet',
  valuation: 'Valuation',
  governance: 'Governance',
  subscriptionSignal: 'Subscription signal',
};

/** One bar per score dimension, scaled to that dimension's maximum points. */
export function ScoreBreakdown({ breakdown }: { breakdown: AiReport['score']['breakdown'] }) {
  return (
    <View className="gap-3">
      {(Object.keys(SCORE_WEIGHTS) as (keyof typeof SCORE_WEIGHTS)[]).map((key) => {
        const max = SCORE_WEIGHTS[key];
        const value = breakdown[key];
        return (
          <View key={key} className="gap-1">
            <View className="flex-row justify-between">
              <Text variant="label">{LABELS[key]}</Text>
              <Text variant="caption">{value === undefined ? 'After bidding closes' : `${value} / ${max}`}</Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-line dark:bg-line-dark">
              <View
                className="h-2 rounded-full bg-brand dark:bg-brand-dark"
                style={{ width: `${((value ?? 0) / max) * 100}%` }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
