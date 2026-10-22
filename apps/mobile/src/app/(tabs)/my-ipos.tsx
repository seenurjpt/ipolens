import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { Ipo } from '@ipolens/shared';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { Glass } from '@/components/glass/glass';
import { HeroCard } from '@/components/glass/hero';
import { useContentInsets } from '@/components/glass/layout';
import { StatusChip } from '@/components/badges';
import { IpoLogo } from '@/components/ipo-logo';
import { ErrorState, Loading } from '@/components/screen-state';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { allottedShares, awaitsAllotmentCheck, CATEGORY_LABELS, listingPnlPaise } from '@/lib/applications';
import { formatDay, formatRupees } from '@/lib/format';
import { useIposBySlug } from '@/lib/queries';
import { useAppStore, type Application } from '@/lib/store';
import { usePalette } from '@/lib/theme';

// Sections in the order a user cares about them.
const GROUPS: { title: string; match: (ipo: Ipo, apps: Application[]) => boolean }[] = [
  { title: 'Check your allotment', match: (ipo, apps) => apps.some((a) => awaitsAllotmentCheck(a, ipo)) },
  { title: 'Bidding open', match: (ipo) => ipo.status === 'OPEN' },
  { title: 'Waiting for allotment', match: (ipo) => ipo.status === 'CLOSED' },
  { title: 'Allotment done', match: (ipo) => ipo.status === 'ALLOTMENT' },
  { title: 'Listed', match: (ipo) => ipo.status === 'LISTED' },
  { title: 'Other', match: () => true },
];

export default function MyIposScreen() {
  const insets = useContentInsets({ tabBar: true });
  const palette = usePalette();
  const applications = useAppStore((s) => s.applications);
  const pans = useAppStore((s) => s.pans);
  const slugs = useMemo(() => [...new Set(applications.map((a) => a.slug))], [applications]);
  const ipos = useIposBySlug(slugs);

  if (applications.length === 0) return <EmptyState />;
  if (ipos.isPending) return <Loading />;
  if (ipos.isError && ipos.bySlug.size === 0) return <ErrorState onRetry={() => void ipos.refetch()} />;

  const panLabel = new Map(pans.map((p) => [p.id, p.label]));
  const appsBySlug = new Map<string, Application[]>();
  for (const a of applications) appsBySlug.set(a.slug, [...(appsBySlug.get(a.slug) ?? []), a]);

  // Each IPO goes in the first group it matches.
  const placed = new Set<string>();
  const sections = GROUPS.map((g) => {
    const items = slugs.flatMap((slug) => {
      const ipo = ipos.bySlug.get(slug);
      const apps = appsBySlug.get(slug) ?? [];
      if (!ipo || placed.has(slug) || !g.match(ipo, apps)) return [];
      placed.add(slug);
      return [{ ipo, apps }];
    });
    return { title: g.title, items };
  }).filter((s) => s.items.length > 0);

  const pnl = applications.reduce((sum, a) => {
    const ipo = ipos.bySlug.get(a.slug);
    return sum + ((ipo && listingPnlPaise(a, ipo)) ?? 0);
  }, 0);
  const listedAllotted = applications.filter(
    (a) => ipos.bySlug.get(a.slug)?.listing && a.allotment === 'ALLOTTED',
  ).length;

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top, paddingBottom: insets.bottom, gap: 20 }}
      refreshControl={
        <RefreshControl refreshing={false} onRefresh={() => void ipos.refetch()} tintColor={palette.brand} />
      }>
      <HeroCard className="gap-1 p-5">
        <Text className="font-sans-medium text-sm text-white/80">Listing-day P&amp;L</Text>
        <Text className="font-sans-bold text-3xl text-white">
          {listedAllotted === 0 ? 'Nothing listed yet' : `${pnl >= 0 ? '+' : '−'}${formatRupees(Math.abs(pnl))}`}
        </Text>
        <Text className="text-xs text-white/80">
          {applications.length} application{applications.length === 1 ? '' : 's'} · {listedAllotted} allotted and listed
          · at listing price
        </Text>
      </HeroCard>

      {sections.map((section) => (
        <View key={section.title} className="gap-3">
          <Text variant="title">{section.title}</Text>
          {section.items.map(({ ipo, apps }) => (
            <AppliedIpoCard key={ipo.slug} ipo={ipo} apps={apps} panLabel={panLabel} />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function AppliedIpoCard({ ipo, apps, panLabel }: { ipo: Ipo; apps: Application[]; panLabel: Map<string, string> }) {
  const needsCheck = apps.some((a) => awaitsAllotmentCheck(a, ipo));
  return (
    <Glass className="gap-3 p-4">
      <Link href={{ pathname: '/ipo/[slug]', params: { slug: ipo.slug } }} asChild>
        <Pressable className="flex-row items-center gap-3 active:opacity-70">
          <IpoLogo name={ipo.name} logoUrl={ipo.logoUrl} />
          <View className="flex-1 gap-1">
            <Text variant="title" numberOfLines={1}>
              {ipo.name}
            </Text>
            <View className="flex-row items-center gap-2">
              <StatusChip status={ipo.status} />
              <Text variant="caption">
                {ipo.status === 'LISTED'
                  ? `Listed ${formatDay(ipo.dates.listing)}`
                  : ipo.status === 'ALLOTMENT'
                    ? `Lists ${formatDay(ipo.dates.listing)}`
                    : `Allotment ${formatDay(ipo.dates.allotment)}`}
              </Text>
            </View>
          </View>
        </Pressable>
      </Link>

      {apps.map((a) => (
        <ApplicationLine key={a.id} app={a} ipo={ipo} label={panLabel.get(a.panId) ?? 'Removed PAN'} />
      ))}

      {needsCheck ? (
        <Link href={{ pathname: '/allotment/[slug]', params: { slug: ipo.slug } }} asChild>
          <Button label="Check allotment" />
        </Link>
      ) : null}
    </Glass>
  );
}

function ApplicationLine({ app, ipo, label }: { app: Application; ipo: Ipo; label: string }) {
  const pnl = listingPnlPaise(app, ipo);
  return (
    <View className="flex-row items-center gap-3 border-t border-line pt-3 dark:border-line-dark">
      <View className="flex-1 gap-0.5">
        <Text variant="label">{label}</Text>
        <Text variant="caption">
          {CATEGORY_LABELS[app.category]} · {app.lots} lot{app.lots === 1 ? '' : 's'}
          {app.allotment === 'ALLOTTED' ? ` · ${allottedShares(app, ipo)} shares allotted` : ''}
        </Text>
      </View>
      <View className="items-end gap-0.5">
        <AllotmentChip app={app} />
        {pnl !== null ? (
          <Text
            className={`font-sans-semibold text-sm ${pnl >= 0 ? 'text-over dark:text-over-dark' : 'text-loss dark:text-loss-dark'}`}>
            {pnl >= 0 ? '+' : '−'}
            {formatRupees(Math.abs(pnl))}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function AllotmentChip({ app }: { app: Application }) {
  const styles = {
    ALLOTTED: { label: 'Allotted', box: 'bg-over-soft dark:bg-over-soft-dark', text: 'text-over dark:text-over-dark' },
    NOT_ALLOTTED: {
      label: 'Not allotted',
      box: 'bg-canvas dark:bg-canvas-dark',
      text: 'text-muted dark:text-muted-dark',
    },
    UNKNOWN: { label: 'Result pending', box: 'bg-canvas dark:bg-canvas-dark', text: 'text-muted dark:text-muted-dark' },
  }[app.allotment];
  return (
    <View className={`rounded-full px-2 py-0.5 ${styles.box}`}>
      <Text className={`font-sans-semibold text-[11px] ${styles.text}`}>{styles.label}</Text>
    </View>
  );
}

function EmptyState() {
  const palette = usePalette();
  return (
    <View className="flex-1 items-center justify-center gap-3 px-10">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-soft dark:bg-brand-soft-dark">
        <MaterialCommunityIcons name="briefcase-outline" size={28} color={palette.brand} />
      </View>
      <Text variant="heading" className="text-center">
        Track your applications
      </Text>
      <Text variant="caption" className="text-center text-sm leading-5">
        Tap &quot;Mark as applied&quot; on any IPO to track it here, across your family&apos;s PANs, with allotment
        results and listing-day gains.
      </Text>
      <Link href="/ipos" asChild>
        <Button label="Browse IPOs" className="mt-2 self-stretch" />
      </Link>
    </View>
  );
}
