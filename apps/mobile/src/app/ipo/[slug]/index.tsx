import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { Ipo } from '@ipolens/shared';
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { BoardTag, GainText, StatusChip } from '@/components/badges';
import { Disclaimer } from '@/components/disclaimer';
import { IpoLogo } from '@/components/ipo-logo';
import { ScoreBreakdown, ScoreRing } from '@/components/score';
import { Empty, ErrorState, Loading } from '@/components/screen-state';
import { SegmentedControl } from '@/components/segmented-control';
import { SubscriptionChart } from '@/components/subscription-chart';
import { SubscriptionTable } from '@/components/subscription-table';
import { Card, Row } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { isStale, UpdatedAgo } from '@/components/updated-ago';
import { useNow } from '@/hooks/use-now';
import {
  biddingEndsAt,
  formatCountdown,
  formatCrore,
  formatDay,
  formatPriceBand,
  formatRupees,
} from '@/lib/format';
import { useIpo, useReport, useSubscription } from '@/lib/queries';
import { usePalette } from '@/lib/theme';

type Tab = 'overview' | 'subscription' | 'analysis' | 'documents';

const TABS = [
  { value: 'overview', label: 'Overview' },
  { value: 'subscription', label: 'Subscription' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'documents', label: 'Docs' },
] as const;

export default function IpoDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const palette = usePalette();
  const [tab, setTab] = useState<Tab>('overview');
  const query = useIpo(slug);

  if (query.isPending) return <Loading />;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => query.refetch()} />;
  const { ipo } = query.data;

  return (
    <>
      <Stack.Screen options={{ title: ipo.name }} />
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={palette.brand} />}>
        <Header ipo={ipo} />
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
        {tab === 'overview' ? <Overview ipo={ipo} /> : null}
        {tab === 'subscription' ? <SubscriptionTab ipo={ipo} /> : null}
        {tab === 'analysis' ? <AnalysisTab slug={ipo.slug} /> : null}
        {tab === 'documents' ? <DocumentsTab ipo={ipo} /> : null}
        <Disclaimer />
      </ScrollView>
    </>
  );
}

function Header({ ipo }: { ipo: Ipo }) {
  const now = useNow();
  const palette = usePalette();
  const { open, close } = ipo.dates;
  const countdown =
    ipo.status === 'OPEN' && close
      ? formatCountdown(biddingEndsAt(close), 'Closes in', 'Bidding closed', now.getTime())
      : ipo.status === 'UPCOMING' && open
        ? formatCountdown(new Date(open.getTime() + 10 * 3_600_000), 'Opens in', 'Opening', now.getTime())
        : null;

  return (
    <View className="gap-4 rounded-2xl border border-line bg-surface p-4 dark:border-line-dark dark:bg-surface-dark">
      <View className="flex-row items-center gap-3">
        <IpoLogo name={ipo.name} logoUrl={ipo.logoUrl} size="lg" />
        <View className="flex-1 gap-1">
          <Text variant="heading" numberOfLines={2}>
            {ipo.name}
          </Text>
          <View className="flex-row flex-wrap items-center gap-2">
            <StatusChip status={ipo.status} />
            <BoardTag board={ipo.board} />
            <Text variant="caption">{ipo.symbol}</Text>
          </View>
        </View>
      </View>
      {countdown ? (
        <View className="flex-row items-center gap-1.5 self-start rounded-full bg-canvas px-3 py-1 dark:bg-canvas-dark">
          <MaterialCommunityIcons name="clock-outline" size={14} color={palette.muted} />
          <Text className="font-sans-semibold text-xs text-ink dark:text-ink-dark">{countdown}</Text>
        </View>
      ) : null}
      <View className="flex-row flex-wrap gap-y-3">
        <Stat label="Price band" value={formatPriceBand(ipo.priceBand)} />
        <Stat label="Lot size" value={`${ipo.lotSize} shares`} />
        <Stat label="Min. investment" value={formatRupees(ipo.minInvestmentPaise)} />
        <Stat label="Issue size" value={formatCrore(ipo.issueSizePaise)} />
      </View>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-1/2 gap-0.5">
      <Text variant="caption">{label}</Text>
      <Text variant="title">{value}</Text>
    </View>
  );
}

// ---------- Overview ----------

const TIMELINE: { key: keyof Ipo['dates']; label: string }[] = [
  { key: 'open', label: 'Bidding opens' },
  { key: 'close', label: 'Bidding closes' },
  { key: 'allotment', label: 'Allotment' },
  { key: 'refundInitiation', label: 'Refunds' },
  { key: 'dematCredit', label: 'Shares in demat' },
  { key: 'listing', label: 'Listing' },
];

function Overview({ ipo }: { ipo: Ipo }) {
  const now = useNow();
  const r = ipo.reservation;
  return (
    <View className="gap-4">
      {ipo.listing ? <ListingCard ipo={ipo} /> : null}
      <Card title="Timeline">
        <View>
          {TIMELINE.map(({ key, label }, idx) => {
            const date = ipo.dates[key];
            const done = !!date && date.getTime() <= now.getTime();
            return (
              <View key={key} className="flex-row gap-3">
                <View className="items-center">
                  <View
                    className={`mt-1 h-3 w-3 rounded-full border-2 ${done ? 'border-brand bg-brand dark:border-brand-dark dark:bg-brand-dark' : 'border-line bg-surface dark:border-line-dark dark:bg-surface-dark'}`}
                  />
                  {idx < TIMELINE.length - 1 ? <View className="w-px flex-1 bg-line dark:bg-line-dark" /> : null}
                </View>
                <View className="flex-1 flex-row justify-between pb-4">
                  <Text variant={done ? 'label' : 'body'} className={done ? '' : 'text-muted dark:text-muted-dark'}>
                    {label}
                  </Text>
                  <Text variant="label">{formatDay(date)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </Card>
      <Card title="Issue details">
        <Row label="Issue type" value={ipo.issueType === 'BOOK_BUILT' ? 'Book built' : 'Fixed price'} />
        <Row label="Fresh issue" value={formatCrore(ipo.freshIssuePaise)} />
        <Row label="Offer for sale" value={formatCrore(ipo.ofsPaise)} />
        <Row label="Listing on" value={ipo.board === 'SME' ? `${ipo.exchanges.join(', ')} SME` : ipo.exchanges.join(', ')} />
        <Row label="Industry" value={ipo.industry} />
        <Row label="Registrar" value={ipo.registrar.name} />
        <Row label="Lead managers" value={ipo.leadManagers.join(', ')} />
      </Card>
      <Card title="Reservation">
        <Row label="QIB" value={`${r.qibPct}%`} />
        <Row label="NII (HNI)" value={`${r.niiPct}%`} />
        <Row label="Retail" value={`${r.retailPct}%`} />
        {r.employeeQuota ? <Row label="Employee quota" value={`${r.employeeQuota.toLocaleString('en-IN')} shares`} /> : null}
      </Card>
    </View>
  );
}

function ListingCard({ ipo }: { ipo: Ipo }) {
  const listing = ipo.listing!;
  const issuePrice = ipo.priceBand.maxPaise;
  const perLot = (listing.pricePaise - issuePrice) * ipo.lotSize;
  return (
    <Card title="Listing day" right={<GainText pct={listing.gainPct} className="text-base" />}>
      <Row label="Issue price" value={formatRupees(issuePrice)} />
      <Row label="Listing price" value={formatRupees(listing.pricePaise)} />
      {listing.closePaise !== undefined ? <Row label="Day close" value={formatRupees(listing.closePaise)} /> : null}
      <Row
        label="Gain per lot at listing"
        value={
          <Text className={`font-sans-semibold ${perLot >= 0 ? 'text-over dark:text-over-dark' : 'text-loss dark:text-loss-dark'}`}>
            {perLot >= 0 ? '+' : '−'}
            {formatRupees(Math.abs(perLot))}
          </Text>
        }
      />
      <Text variant="caption">Source: NSE/BSE</Text>
    </Card>
  );
}

// ---------- Subscription ----------

function SubscriptionTab({ ipo }: { ipo: Ipo }) {
  const live = ipo.status === 'OPEN';
  const query = useSubscription(ipo.slug, live);
  const now = useNow();

  if (query.isPending) return <Loading />;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => query.refetch()} />;
  const { latest, history, asOf } = query.data;
  if (!latest) {
    return (
      <Empty
        title="No bids yet"
        note={ipo.dates.open ? `Live subscription starts when bidding opens on ${formatDay(ipo.dates.open)}.` : undefined}
      />
    );
  }

  return (
    <View className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text variant="title">{live ? 'Live subscription' : 'Final subscription'}</Text>
        <UpdatedAgo asOf={asOf} live={live} source="NSE + BSE" />
      </View>
      <SubscriptionTable figures={latest} reservation={ipo.reservation} stale={isStale(asOf, live, now)} />
      {history.length > 1 ? (
        <View className="gap-2">
          <Text variant="title">Over time</Text>
          <SubscriptionChart history={history} />
        </View>
      ) : null}
    </View>
  );
}

// ---------- Analysis ----------

function AnalysisTab({ slug }: { slug: string }) {
  const query = useReport(slug);
  if (query.isPending) return <Loading />;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => query.refetch()} />;
  if (!query.data) {
    return <Empty title="Analysis in progress" note="We publish it once the RHP has been read and checked by a person." />;
  }
  const { report } = query.data;
  return (
    <Card>
      <View className="flex-row items-center gap-4">
        <ScoreRing total={report.score.total} />
        <View className="flex-1 gap-1">
          <Text variant="title">Analysis score</Text>
          <Text variant="caption">Built from figures disclosed in the RHP. A summary of the data, not a rating.</Text>
        </View>
      </View>
      <ScoreBreakdown breakdown={report.score.breakdown} />
      <Link href={{ pathname: '/ipo/[slug]/report', params: { slug } }} asChild>
        <Pressable className="items-center rounded-xl bg-brand py-3 active:opacity-80 dark:bg-brand-dark">
          <Text className="font-sans-semibold text-white dark:text-canvas-dark">Read the full report</Text>
        </Pressable>
      </Link>
    </Card>
  );
}

// ---------- Documents ----------

function DocumentsTab({ ipo }: { ipo: Ipo }) {
  const palette = usePalette();
  const docs = [
    { label: 'Red Herring Prospectus (RHP)', url: ipo.documents.rhpUrl },
    { label: 'Draft Red Herring Prospectus (DRHP)', url: ipo.documents.drhpUrl },
  ].filter((d): d is { label: string; url: string } => !!d.url);

  if (docs.length === 0) return <Empty title="No documents yet" note="Offer documents appear here once filed." />;
  return (
    <Card>
      {docs.map((d) => (
        <Pressable
          key={d.url}
          accessibilityRole="link"
          onPress={() => WebBrowser.openBrowserAsync(d.url)}
          className="flex-row items-center gap-3 active:opacity-70">
          <MaterialCommunityIcons name="file-document-outline" size={22} color={palette.brand} />
          <Text variant="label" className="flex-1">
            {d.label}
          </Text>
          <MaterialCommunityIcons name="open-in-new" size={16} color={palette.muted} />
        </Pressable>
      ))}
    </Card>
  );
}
