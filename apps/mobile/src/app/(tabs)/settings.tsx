import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { AlertType } from '@ipolens/shared';
import Constants from 'expo-constants';
import { Link, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';

import { SegmentedControl } from '@/components/segmented-control';
import { Button } from '@/components/ui/button';
import { Card, Row } from '@/components/ui/card';
import { ToggleRow } from '@/components/ui/controls';
import { Text } from '@/components/ui/text';
import { canUseBiometricLock, deleteAllData, maskPan, removePan, unlockPans } from '@/lib/pans';
import { useAppStore, type SavedPan, type ThemePreference } from '@/lib/store';
import { usePalette } from '@/lib/theme';

const ALERTS: { type: AlertType; label: string; note: string }[] = [
  { type: 'NEW_IPO', label: 'New mainboard IPO announced', note: 'When a new issue is added' },
  { type: 'OPEN', label: 'IPO opens today', note: '9:30 AM on the opening day' },
  { type: 'LAST_DAY', label: 'Last day to bid', note: "10 AM on the closing day, unless you've applied" },
  { type: 'SUB_MILESTONE', label: 'Subscription milestones', note: 'Retail crosses 1x, QIB crosses 10x' },
  { type: 'ALLOTMENT_OUT', label: 'Allotment is out', note: "For IPOs you've applied to" },
  { type: 'LISTING', label: 'Listing day', note: 'Listing price for IPOs you applied to or follow' },
];

const THEMES = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
] as const;

export default function SettingsScreen() {
  const pans = useAppStore((s) => s.pans);
  const alerts = useAppStore((s) => s.alerts);
  const setAlert = useAppStore((s) => s.setAlert);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Card title="Saved PANs">
        <Text variant="caption">Stored encrypted on this phone only. Used to fill the registrar&apos;s PAN box.</Text>
        {pans.map((p) => (
          <PanRow key={p.id} pan={p} />
        ))}
        <Link href="/pans/add" asChild>
          <Button label="Add a PAN" variant="secondary" />
        </Link>
        <BiometricToggle />
      </Card>

      <Card title="Alerts">
        <Text variant="caption">Saved on this phone. Push alerts start once notifications are connected.</Text>
        {ALERTS.map((a) => (
          <ToggleRow key={a.type} label={a.label} note={a.note} value={alerts[a.type]} onChange={(on) => setAlert(a.type, on)} />
        ))}
      </Card>

      <Card title="Appearance">
        <SegmentedControl options={THEMES} value={theme} onChange={(v: ThemePreference) => setTheme(v)} />
        <Row label="Language" value="English" />
        <Text variant="caption">Hindi and Gujarati are coming later.</Text>
      </Card>

      <Card title="Disclaimer">
        <Text className="leading-5">
          IPOLens is an information tool. It is not investment advice, and IPOLens is not registered with SEBI as a
          research analyst or investment adviser.
        </Text>
        <Text className="leading-5">
          The analysis score summarises figures disclosed in each company&apos;s offer document. It is not a rating or a
          recommendation. Exchange data is shown as published by NSE and BSE, with the time it was last updated, and may
          be delayed.
        </Text>
        <Text className="leading-5">Read the offer document and consult a registered adviser before you invest.</Text>
      </Card>

      <Card title="Your data">
        <Text variant="caption">
          Deletes your saved PANs, applications and preferences from this phone. This cannot be undone.
        </Text>
        <DeleteAll />
      </Card>

      <Card title="About">
        <Row label="Version" value={Constants.expoConfig?.version ?? '–'} />
        <Row label="Data" value="NSE, BSE, SEBI filings" />
      </Card>
    </ScrollView>
  );
}

/** One saved PAN; removing it asks for confirmation inline (no blocking dialog). */
function PanRow({ pan }: { pan: SavedPan }) {
  const palette = usePalette();
  const [confirming, setConfirming] = useState(false);
  const appCount = useAppStore((s) => s.applications.filter((a) => a.panId === pan.id).length);

  const remove = async () => {
    if (await unlockPans(`Remove ${pan.label}'s PAN`)) await removePan(pan.id);
    setConfirming(false);
  };

  return (
    <View className="gap-2 rounded-xl border border-line p-3 dark:border-line-dark">
      <View className="flex-row items-center gap-3">
        <MaterialCommunityIcons name="card-account-details-outline" size={22} color={palette.brand} />
        <View className="flex-1">
          <Text variant="label">{pan.label}</Text>
          <Text variant="caption" className="tracking-widest">
            {maskPan(pan.last4)}
          </Text>
        </View>
        {!confirming ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${pan.label}`} onPress={() => setConfirming(true)} hitSlop={8}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={palette.muted} />
          </Pressable>
        ) : null}
      </View>
      {confirming ? (
        <View className="gap-2">
          <Text variant="caption">
            Remove this PAN{appCount ? ` and its ${appCount} application${appCount > 1 ? 's' : ''}` : ''}?
          </Text>
          <View className="flex-row gap-2">
            <Button label="Cancel" variant="secondary" className="flex-1" onPress={() => setConfirming(false)} />
            <Button label="Remove" variant="danger" className="flex-1" onPress={remove} />
          </View>
        </View>
      ) : null}
    </View>
  );
}

function BiometricToggle() {
  const enabled = useAppStore((s) => s.biometricLock);
  const setBiometricLock = useAppStore((s) => s.setBiometricLock);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    canUseBiometricLock().then(setAvailable);
  }, []);

  const note =
    Platform.OS === 'web'
      ? 'Available in the Android app'
      : available
        ? 'Ask for fingerprint or screen lock before using a PAN'
        : 'Set up a fingerprint or screen lock on this phone first';

  return (
    <ToggleRow
      label="Lock PANs"
      note={note}
      value={enabled}
      disabled={!available}
      onChange={async (on) => {
        // Turning the lock off must itself pass the lock.
        if (!on && !(await unlockPans('Turn off the PAN lock'))) return;
        setBiometricLock(on);
      }}
    />
  );
}

function DeleteAll() {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) return <Button label="Delete all my data" variant="danger" onPress={() => setConfirming(true)} />;
  return (
    <View className="flex-row gap-2">
      <Button label="Cancel" variant="secondary" className="flex-1" onPress={() => setConfirming(false)} />
      <Button
        label="Delete everything"
        variant="danger"
        className="flex-1"
        onPress={async () => {
          if (!(await unlockPans('Delete all IPOLens data'))) return;
          await deleteAllData();
          router.replace('/onboarding');
        }}
      />
    </View>
  );
}
