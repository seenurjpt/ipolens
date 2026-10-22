import type { ApplicationCategory, Ipo } from '@ipolens/shared';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { useContentInsets } from '@/components/glass/layout';
import { ErrorState, Loading } from '@/components/screen-state';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckRow, Chip, Stepper } from '@/components/ui/controls';
import { Text } from '@/components/ui/text';
import { CATEGORY_LABELS, maxLots } from '@/lib/applications';
import { formatRupees } from '@/lib/format';
import { maskPan } from '@/lib/pans';
import { useIpo } from '@/lib/queries';
import { useAppStore } from '@/lib/store';

export default function ApplyScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const query = useIpo(slug);
  if (query.isPending) return <Loading />;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => query.refetch()} />;
  return <ApplyForm ipo={query.data.ipo} />;
}

function ApplyForm({ ipo }: { ipo: Ipo }) {
  const insets = useContentInsets();
  const pans = useAppStore((s) => s.pans);
  const saveApplications = useAppStore((s) => s.saveApplications);
  const existing = useAppStore(useShallow((s) => s.applications.filter((a) => a.ipoId === ipo._id)));

  // Start from what the user saved before, or one retail lot on every PAN.
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(existing.length ? existing.map((a) => a.panId) : pans.length === 1 ? [pans[0]!.id] : []),
  );
  const [category, setCategory] = useState<ApplicationCategory>(existing[0]?.category ?? 'RETAIL');
  const [lots, setLots] = useState(existing[0]?.lots ?? 1);

  const categories: ApplicationCategory[] =
    ipo.board === 'SME' ? ['RETAIL', 'SHNI', 'BHNI'] : ['RETAIL', 'SHNI', 'BHNI', 'EMPLOYEE', 'SHAREHOLDER'];
  const max = maxLots(ipo, category);
  const amount = lots * ipo.lotSize * ipo.priceBand.maxPaise;

  const toggle = (panId: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(panId)) next.delete(panId);
      else next.add(panId);
      return next;
    });

  const save = () => {
    saveApplications(
      { ipoId: ipo._id, slug: ipo.slug },
      [...selected].map((panId) => ({ panId, category, lots: Math.min(lots, max) })),
    );
    router.back();
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top, paddingBottom: insets.bottom, gap: 16 }}>
      <Text variant="heading">{ipo.name}</Text>

      <Card title="Applied with">
        {pans.length === 0 ? (
          <Text variant="caption">Add a PAN to track whose application this is.</Text>
        ) : (
          pans.map((p) => (
            <CheckRow
              key={p.id}
              label={p.label}
              note={maskPan(p.last4)}
              checked={selected.has(p.id)}
              onToggle={() => toggle(p.id)}
            />
          ))
        )}
        <Link href="/pans/add" asChild>
          <Button label="Add a PAN" variant="ghost" className="self-start px-0" />
        </Link>
      </Card>

      <Card title="Category">
        <View className="flex-row flex-wrap gap-2">
          {categories.map((c) => (
            <Chip
              key={c}
              label={CATEGORY_LABELS[c]}
              selected={category === c}
              onPress={() => {
                setCategory(c);
                setLots((l) => Math.min(l, maxLots(ipo, c)));
              }}
            />
          ))}
        </View>
      </Card>

      <Card title="Lots per PAN">
        <View className="flex-row items-center justify-between">
          <Stepper value={Math.min(lots, max)} min={1} max={max} onChange={setLots} label="lots" />
          <View className="items-end">
            <Text variant="title">{formatRupees(amount)}</Text>
            <Text variant="caption">
              {lots * ipo.lotSize} shares at {formatRupees(ipo.priceBand.maxPaise)}
            </Text>
          </View>
        </View>
        <Text variant="caption">Up to {max} lots per PAN in this category.</Text>
      </Card>

      <Text variant="caption" className="px-1">
        This only records your application in IPOLens. Bids are placed through your broker or UPI app.
      </Text>

      <Button
        label={selected.size === 0 && existing.length > 0 ? 'Remove from My IPOs' : 'Save'}
        variant={selected.size === 0 && existing.length > 0 ? 'danger' : 'primary'}
        disabled={selected.size === 0 && existing.length === 0}
        onPress={save}
      />
    </ScrollView>
  );
}
