import type { IpoInput, SubscriptionFigures } from '@ipolens/shared';
import { View } from 'react-native';

import { MultipleText } from './badges';
import { Text } from './ui/text';

interface Row {
  label: string;
  value: number | undefined;
  share?: number; // % of the issue reserved for the category
  indent?: boolean;
  strong?: boolean;
}

export function SubscriptionTable({
  figures,
  reservation,
  stale,
}: {
  figures: SubscriptionFigures;
  reservation: IpoInput['reservation'];
  stale: boolean;
}) {
  const rows: Row[] = [
    { label: 'QIB', value: figures.qib, share: reservation.qibPct },
    { label: 'NII', value: figures.nii, share: reservation.niiPct },
    { label: 'bNII (above ₹10L)', value: figures.bnii, indent: true },
    { label: 'sNII (₹2L–10L)', value: figures.snii, indent: true },
    { label: 'Retail', value: figures.retail, share: reservation.retailPct },
    { label: 'Employee', value: figures.employee },
    { label: 'Total', value: figures.total, strong: true },
  ];

  return (
    <View className="overflow-hidden rounded-2xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
      <View className="flex-row bg-canvas px-4 py-2 dark:bg-canvas-dark">
        <Text variant="caption" className="flex-1">
          Category
        </Text>
        <Text variant="caption" className="w-16 text-right">
          Quota
        </Text>
        <Text variant="caption" className="w-20 text-right">
          Subscribed
        </Text>
      </View>
      {rows
        .filter((r) => r.value !== undefined && !(r.share === 0 && r.value === 0))
        .map((r) => (
          <View
            key={r.label}
            className={`flex-row items-center border-t border-line px-4 py-2.5 dark:border-line-dark ${r.strong ? 'bg-canvas/50 dark:bg-canvas-dark/50' : ''}`}>
            <Text
              variant={r.strong ? 'title' : r.indent ? 'caption' : 'label'}
              className={`flex-1 ${r.indent ? 'pl-3' : ''}`}>
              {r.label}
            </Text>
            <Text variant="caption" className="w-16 text-right">
              {r.share !== undefined ? `${r.share}%` : ''}
            </Text>
            <View className="w-20 items-end">
              <MultipleText value={r.value!} stale={stale} className={r.strong ? 'text-base' : 'text-sm'} />
            </View>
          </View>
        ))}
    </View>
  );
}
