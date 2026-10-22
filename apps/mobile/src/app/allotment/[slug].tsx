import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { Ipo } from '@ipolens/shared';
import * as Clipboard from 'expo-clipboard';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Glass } from '@/components/glass/glass';
import { useContentInsets } from '@/components/glass/layout';
import { RegistrarFrame } from '@/components/registrar-frame';
import { Empty, ErrorState, Loading } from '@/components/screen-state';
import { Button } from '@/components/ui/button';
import { Chip, Stepper } from '@/components/ui/controls';
import { Text } from '@/components/ui/text';
import { revealPan } from '@/lib/pans';
import { useIpo, useRegistrar } from '@/lib/queries';
import { useAppStore } from '@/lib/store';
import { usePalette } from '@/lib/theme';

export default function AllotmentScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const ipo = useIpo(slug);
  const registrar = useRegistrar(ipo.data?.ipo.registrar.code);

  if (ipo.isPending || (ipo.data && registrar.isPending)) return <Loading />;
  if (ipo.isError) return <ErrorState message={ipo.error.message} onRetry={() => ipo.refetch()} />;
  if (registrar.isError || !registrar.data)
    return <ErrorState message="Couldn't load the registrar's details." onRetry={() => registrar.refetch()} />;
  return <AllotmentFlow ipo={ipo.data.ipo} registrar={registrar.data.registrar} />;
}

type Registrar = NonNullable<ReturnType<typeof useRegistrar>['data']>['registrar'];

function AllotmentFlow({ ipo, registrar }: { ipo: Ipo; registrar: Registrar }) {
  const insets = useContentInsets();
  const pans = useAppStore((s) => s.pans);
  const applications = useAppStore((s) => s.applications);
  // Default to the first PAN that applied and has no result yet.
  const firstPending = applications.find((a) => a.ipoId === ipo._id && a.allotment === 'UNKNOWN')?.panId;
  const [panId, setPanId] = useState<string | undefined>(firstPending ?? pans[0]?.id);
  const [pan, setPan] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);

  if (pans.length === 0) {
    return (
      <View className="flex-1 justify-center gap-4 p-6">
        <Empty
          title="Add a PAN first"
          note="Your PAN is filled into the registrar's page so you don't have to type it."
        />
        <Link href="/pans/add" asChild>
          <Button label="Add a PAN" />
        </Link>
      </View>
    );
  }

  if (!pan) {
    return (
      <View className="flex-1 gap-5 px-4" style={{ paddingTop: insets.top }}>
        <View className="gap-1">
          <Text variant="heading">{ipo.name}</Text>
          <Text variant="caption">Registrar: {registrar.name}</Text>
        </View>
        <View className="gap-2">
          <Text variant="label">Check for</Text>
          <View className="flex-row flex-wrap gap-2">
            {pans.map((p) => (
              <Chip key={p.id} label={p.label} selected={panId === p.id} onPress={() => setPanId(p.id)} />
            ))}
          </View>
        </View>
        <Text variant="caption" className="leading-4">
          The registrar&apos;s own page opens next. Pick this IPO in its list, enter the PAN and solve the CAPTCHA.
          IPOLens never reads your result; you record it yourself afterwards.
        </Text>
        <Button
          label="Continue"
          disabled={!panId}
          onPress={async () => setPan(panId ? await revealPan(panId, 'Use your PAN to check allotment') : null)}
        />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      <PanBar pan={pan} autoFilled={!!registrar.panFieldSelector} />
      <View className="flex-1">
        <RegistrarFrame
          url={registrar.allotmentUrl}
          allowedHosts={registrar.allowedHosts}
          panFieldSelector={registrar.panFieldSelector}
          pan={pan}
        />
      </View>
      {recording ? (
        <RecordResult ipo={ipo} panId={panId!} onDone={() => router.back()} onCancel={() => setRecording(false)} />
      ) : (
        <View className="px-4 pt-2" style={{ paddingBottom: insets.bottom - 8 }}>
          <Button label="I've seen my result" onPress={() => setRecording(true)} />
        </View>
      )}
    </View>
  );
}

/** Shows the PAN to enter, with a copy button when the page could not be filled in for the user. */
function PanBar({ pan, autoFilled }: { pan: string; autoFilled: boolean }) {
  const palette = usePalette();
  const [copied, setCopied] = useState(false);
  return (
    <Glass className="mx-3 mb-2 flex-row items-center gap-3 px-4 py-2.5">
      <View className="flex-1">
        <Text variant="caption">{autoFilled ? 'PAN filled in' : 'Enter this PAN on the page'}</Text>
        <Text selectable className="font-sans-bold tracking-widest text-ink dark:text-ink-dark">
          {pan}
        </Text>
      </View>
      {!autoFilled ? (
        <Pressable
          accessibilityRole="button"
          onPress={async () => {
            await Clipboard.setStringAsync(pan);
            setCopied(true);
          }}
          className="flex-row items-center gap-1.5 rounded-full border border-rim bg-strong px-3 py-2 active:opacity-70 dark:border-rim-dark dark:bg-strong-dark">
          <MaterialCommunityIcons name={copied ? 'check' : 'content-copy'} size={16} color={palette.brand} />
          <Text className="font-sans-semibold text-xs text-brand dark:text-brand-dark">
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </Pressable>
      ) : null}
    </Glass>
  );
}

/** "Were you allotted?" — saves the answer against this PAN's application, creating it if needed. */
function RecordResult({
  ipo,
  panId,
  onDone,
  onCancel,
}: {
  ipo: Ipo;
  panId: string;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [allotted, setAllotted] = useState<boolean | null>(null);
  const [lots, setLots] = useState(1);

  const save = () => {
    const store = useAppStore.getState();
    let app = store.applications.find((a) => a.ipoId === ipo._id && a.panId === panId);
    if (!app) {
      const others = store.applications
        .filter((a) => a.ipoId === ipo._id)
        .map(({ panId: p, category, lots: l }) => ({ panId: p, category, lots: l }));
      store.saveApplications({ ipoId: ipo._id, slug: ipo.slug }, [...others, { panId, category: 'RETAIL', lots: 1 }]);
      app = useAppStore.getState().applications.find((a) => a.ipoId === ipo._id && a.panId === panId)!;
    }
    store.setAllotment(app.id, allotted ? 'ALLOTTED' : 'NOT_ALLOTTED', allotted ? lots * ipo.lotSize : undefined);
    onDone();
  };

  return (
    <Glass className="m-3 gap-3 p-4">
      <Text variant="title">Were you allotted?</Text>
      <View className="flex-row gap-2">
        <Button
          label="Yes"
          variant={allotted === true ? 'primary' : 'secondary'}
          className="flex-1"
          onPress={() => setAllotted(true)}
        />
        <Button
          label="No"
          variant={allotted === false ? 'primary' : 'secondary'}
          className="flex-1"
          onPress={() => setAllotted(false)}
        />
      </View>
      {allotted ? (
        <View className="flex-row items-center justify-between">
          <Text variant="label">Lots allotted</Text>
          <Stepper value={lots} min={1} max={50} onChange={setLots} label="lots allotted" />
        </View>
      ) : null}
      <View className="flex-row gap-2">
        <Button label="Back" variant="ghost" className="flex-1" onPress={onCancel} />
        <Button label="Save result" className="flex-1" disabled={allotted === null} onPress={save} />
      </View>
    </Glass>
  );
}
