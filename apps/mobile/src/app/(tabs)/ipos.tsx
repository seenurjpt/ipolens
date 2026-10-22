import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { Board, IpoSort, IpoStatus } from '@ipolens/shared';
import { FlashList } from '@shopify/flash-list';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, TextInput, View } from 'react-native';

import { IpoCard } from '@/components/ipo-card';
import { Empty, ErrorState, Loading } from '@/components/screen-state';
import { FilterChips, SegmentedControl } from '@/components/segmented-control';
import { useContentInsets } from '@/components/glass/layout';
import { useNow } from '@/hooks/use-now';
import { useIpoPages } from '@/lib/queries';
import { usePalette } from '@/lib/theme';

type Segment = 'upcoming' | 'open' | 'closed' | 'listed';

const SEGMENTS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'open', label: 'Open' },
  { value: 'closed', label: 'Closed' },
  { value: 'listed', label: 'Listed' },
] as const;

// "Closed" covers both closed and allotment-stage issues; each segment has its natural order.
const SEGMENT_QUERY: Record<Segment, { status: IpoStatus[]; sort: IpoSort }> = {
  upcoming: { status: ['UPCOMING'], sort: 'openAsc' },
  open: { status: ['OPEN'], sort: 'closeAsc' },
  closed: { status: ['CLOSED', 'ALLOTMENT'], sort: 'closeDesc' },
  listed: { status: ['LISTED'], sort: 'listingDesc' },
};

const BOARDS = [
  { value: 'ALL', label: 'All' },
  { value: 'MAINBOARD', label: 'Mainboard' },
  { value: 'SME', label: 'SME' },
] as const;

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

export default function ExploreScreen() {
  const palette = usePalette();
  const now = useNow();
  const insets = useContentInsets({ tabBar: true });
  const [segment, setSegment] = useState<Segment>('open');
  const [board, setBoard] = useState<Board | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const q = useDebounced(search.trim(), 300);

  const query = useIpoPages({
    ...SEGMENT_QUERY[segment],
    board: board === 'ALL' ? undefined : board,
    q: q || undefined,
  });
  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);

  return (
    <View className="flex-1">
      <View className="gap-3 px-4 pb-3" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center gap-2 rounded-full border border-rim bg-strong px-4 dark:border-rim-dark dark:bg-strong-dark">
          <MaterialCommunityIcons name="magnify" size={18} color={palette.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by company or symbol"
            placeholderTextColor={palette.muted}
            autoCorrect={false}
            returnKeyType="search"
            className="flex-1 py-2.5 font-sans text-sm text-ink dark:text-ink-dark"
          />
        </View>
        <SegmentedControl options={SEGMENTS} value={segment} onChange={setSegment} />
        <FilterChips options={BOARDS} value={board} onChange={setBoard} />
      </View>

      {query.isPending ? (
        <Loading />
      ) : query.isError ? (
        <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      ) : (
        <FlashList
          data={items}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <IpoCard ipo={item} now={now.getTime()} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom }}
          ItemSeparatorComponent={() => <View className="h-3" />}
          onEndReached={() => query.hasNextPage && !query.isFetchingNextPage && query.fetchNextPage()}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching}
              onRefresh={() => void query.refetch()}
              tintColor={palette.brand}
            />
          }
          ListEmptyComponent={
            <Empty title={q ? `Nothing matches "${q}"` : 'No IPOs here yet'} note="Try another tab or filter." />
          }
          ListFooterComponent={
            query.isFetchingNextPage ? <ActivityIndicator className="py-4" color={palette.brand} /> : null
          }
        />
      )}
    </View>
  );
}
