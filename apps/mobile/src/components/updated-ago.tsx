import { View } from 'react-native';

import { useNow } from '@/hooks/use-now';
import { formatAgo, isBiddingHours } from '@/lib/format';

import { Text } from './ui/text';

const STALE_AFTER_MS = 30 * 60_000;

/**
 * True when live numbers should be greyed out: more than 30 minutes old while bidding is
 * running (SPEC: Mobile app screens > UX rules).
 */
export function isStale(asOf: Date, live: boolean, now: Date): boolean {
  return live && isBiddingHours(now) && now.getTime() - asOf.getTime() > STALE_AFTER_MS;
}

/** "Updated 3 min ago", with a live dot while the IPO is open. */
export function UpdatedAgo({ asOf, live = false, source }: { asOf: Date; live?: boolean; source?: string }) {
  const now = useNow();
  const stale = isStale(asOf, live, now);
  return (
    <View className="flex-row items-center gap-1.5">
      {live ? (
        <View className={`h-1.5 w-1.5 rounded-full ${stale ? 'bg-muted dark:bg-muted-dark' : 'bg-over dark:bg-over-dark'}`} />
      ) : null}
      <Text variant="caption">
        {stale ? 'Delayed · ' : ''}Updated {formatAgo(asOf, now.getTime())}
        {source ? ` · Source: ${source}` : ''}
      </Text>
    </View>
  );
}
