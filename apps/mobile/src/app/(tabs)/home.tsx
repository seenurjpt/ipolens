import type { IpoCard as IpoCardData } from '@ipolens/shared';
import { FlashList } from '@shopify/flash-list';
import { Link } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { GainText, MultipleText } from '@/components/badges';
import { IpoCard } from '@/components/ipo-card';
import { IpoLogo } from '@/components/ipo-logo';
import { Empty, ErrorState, Loading } from '@/components/screen-state';
import { Text } from '@/components/ui/text';
import { UpdatedAgo } from '@/components/updated-ago';
import { useNow } from '@/hooks/use-now';
import { biddingEndsAt, formatCountdown, formatDay, isSameIstDay } from '@/lib/format';
import { useIpoList, useRecentListings } from '@/lib/queries';
import { usePalette } from '@/lib/theme';

export default function HomeScreen() {
  const palette = usePalette();
  const now = useNow();
  const open = useIpoList({ status: ['OPEN'], sort: 'closeAsc', pageSize: 50 });
  const listings = useRecentListings(5);

  if (open.isPending) return <Loading />;
  if (open.isError) return <ErrorState message={open.error.message} onRetry={() => open.refetch()} />;

  const items = open.data.items;
  const closingToday = items.filter((i) => i.dates.close && isSameIstDay(i.dates.close, now));
  const latestAt = items
    .map((i) => i.latestSubscription?.at)
    .filter((d): d is Date => !!d)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return (
    <FlashList
      data={items}
      keyExtractor={(i) => i._id}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      ItemSeparatorComponent={() => <View className="h-3" />}
      refreshControl={
        <RefreshControl
          refreshing={open.isRefetching}
          onRefresh={() => {
            open.refetch();
            listings.refetch();
          }}
          tintColor={palette.brand}
        />
      }
      ListHeaderComponent={
        <View className="gap-5 pb-3 pt-2">
          {closingToday.length > 0 ? <ClosingToday items={closingToday} now={now.getTime()} /> : null}
          <View className="flex-row items-end justify-between">
            <View>
              <Text variant="heading">Open now</Text>
              <Text variant="caption">Closing soonest first</Text>
            </View>
            {latestAt ? <UpdatedAgo asOf={latestAt} live /> : null}
          </View>
        </View>
      }
      renderItem={({ item }) => <IpoCard ipo={item} now={now.getTime()} />}
      ListEmptyComponent={<Empty title="No IPOs open right now" note="Upcoming issues are in Explore." />}
      ListFooterComponent={<RecentListings query={listings} />}
    />
  );
}

function ClosingToday({ items, now }: { items: IpoCardData[]; now: number }) {
  return (
    <View className="gap-2">
      <Text variant="title">Closing today</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {items.map((ipo) => (
          <Link key={ipo._id} href={{ pathname: '/ipo/[slug]', params: { slug: ipo.slug } }} asChild>
            <Pressable className="w-44 gap-2 rounded-2xl bg-under-soft p-3 active:opacity-80 dark:bg-under-soft-dark">
              <Text variant="label" numberOfLines={1}>
                {ipo.name}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="font-sans-semibold text-xs text-under dark:text-under-dark">
                  {formatCountdown(biddingEndsAt(ipo.dates.close!), 'Ends in', 'Closed', now)}
                </Text>
                {ipo.latestSubscription ? <MultipleText value={ipo.latestSubscription.total} className="text-xs" /> : null}
              </View>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </View>
  );
}

function RecentListings({ query }: { query: ReturnType<typeof useRecentListings> }) {
  const items = query.data?.items ?? [];
  if (items.length === 0) return null;
  return (
    <View className="gap-2 pt-7">
      <Text variant="heading">Recent listings</Text>
      <View className="overflow-hidden rounded-2xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
        {items.map((ipo, idx) => (
          <Link key={ipo._id} href={{ pathname: '/ipo/[slug]', params: { slug: ipo.slug } }} asChild>
            <Pressable
              className={`flex-row items-center gap-3 px-4 py-3 active:opacity-70 ${idx > 0 ? 'border-t border-line dark:border-line-dark' : ''}`}>
              <IpoLogo name={ipo.name} logoUrl={ipo.logoUrl} />
              <View className="flex-1">
                <Text variant="label" numberOfLines={1}>
                  {ipo.name}
                </Text>
                <Text variant="caption">Listed {formatDay(ipo.dates.listing)}</Text>
              </View>
              <GainText pct={ipo.listing.gainPct} />
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}
