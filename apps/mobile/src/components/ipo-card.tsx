import type { IpoCard as IpoCardData } from '@ipolens/shared';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { biddingEndsAt, formatCountdown, formatDay, formatPriceBand, formatRupees } from '@/lib/format';

import { BoardTag, GainText, MultipleText, StatusChip } from './badges';
import { IpoLogo } from './ipo-logo';
import { Text } from './ui/text';

/** The one line of dates that matters for the IPO's stage. */
function dateLine(ipo: IpoCardData, now: number): string {
  const { open, close, allotment, listing } = ipo.dates;
  switch (ipo.status) {
    case 'UPCOMING':
      return open ? `Opens ${formatDay(open)}` : 'Dates to be announced';
    case 'OPEN':
      return close ? formatCountdown(biddingEndsAt(close), 'Closes in', 'Closing') : 'Open now';
    case 'CLOSED':
      return `Allotment ${formatDay(allotment)}`;
    case 'ALLOTMENT':
      return `Lists ${formatDay(listing)}`;
    case 'LISTED':
      return `Listed ${formatDay(listing)}`;
    case 'WITHDRAWN':
      return 'Issue withdrawn';
  }
  return '';
}

/** The figure on the right: subscription while bidding, listing gain once listed. */
function Headline({ ipo }: { ipo: IpoCardData }) {
  if (ipo.listing) {
    return (
      <View className="items-end">
        <GainText pct={ipo.listing.gainPct} className="text-base" />
        <Text variant="caption">listing gain</Text>
      </View>
    );
  }
  if (ipo.latestSubscription) {
    return (
      <View className="items-end">
        <MultipleText value={ipo.latestSubscription.total} className="text-base" />
        <Text variant="caption">subscribed</Text>
      </View>
    );
  }
  return null;
}

export function IpoCard({ ipo, now }: { ipo: IpoCardData; now: number }) {
  return (
    <Link href={{ pathname: '/ipo/[slug]', params: { slug: ipo.slug } }} asChild>
      <Pressable
        accessibilityRole="link"
        className="rounded-2xl border border-line bg-surface p-4 active:opacity-80 dark:border-line-dark dark:bg-surface-dark">
        <View className="flex-row items-center gap-3">
          <IpoLogo name={ipo.name} logoUrl={ipo.logoUrl} />
          <View className="flex-1 gap-1">
            <View className="flex-row items-center gap-1.5">
              <Text variant="title" numberOfLines={1} className="shrink">
                {ipo.name}
              </Text>
              <BoardTag board={ipo.board} />
            </View>
            <View className="flex-row items-center gap-2">
              <StatusChip status={ipo.status} />
              <Text variant="caption">{dateLine(ipo, now)}</Text>
            </View>
          </View>
          <Headline ipo={ipo} />
        </View>
        <View className="mt-3 flex-row border-t border-line pt-3 dark:border-line-dark">
          <Stat label="Price band" value={formatPriceBand(ipo.priceBand)} />
          <Stat label="Min. investment" value={formatRupees(ipo.minInvestmentPaise)} />
          <Stat label="Lot" value={`${ipo.lotSize} shares`} />
        </View>
      </Pressable>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 gap-0.5">
      <Text variant="caption">{label}</Text>
      <Text variant="label" numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}
