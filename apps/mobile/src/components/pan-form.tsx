import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { addPan, PanError } from '@/lib/pans';
import { usePalette } from '@/lib/theme';

import { Button } from './ui/button';
import { CheckRow, Chip } from './ui/controls';
import { Text } from './ui/text';

const QUICK_LABELS = ['Self', 'Spouse', 'Mom', 'Dad', 'Child'];

const inputClass =
  'rounded-2xl border border-rim bg-strong px-4 py-3 font-sans text-base text-ink dark:border-rim-dark dark:bg-strong-dark dark:text-ink-dark';

/** Label + PAN + consent, saved on this device only. Calls onSaved with the new PAN's id. */
export function PanForm({
  onSaved,
  submitLabel = 'Save PAN',
}: {
  onSaved: (panId: string) => void;
  submitLabel?: string;
}) {
  const palette = usePalette();
  const [label, setLabel] = useState('');
  const [pan, setPan] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setError(null);
    setBusy(true);
    try {
      onSaved(await addPan(label, pan));
    } catch (err) {
      setError(err instanceof PanError ? err.message : 'Could not save this PAN. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="gap-5">
      <View className="gap-2">
        <Text variant="label" nativeID="pan-label">
          Whose PAN is this?
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {QUICK_LABELS.map((l) => (
            <Chip key={l} label={l} selected={label === l} onPress={() => setLabel(l)} />
          ))}
        </View>
        <TextInput
          accessibilityLabelledBy="pan-label"
          value={label}
          onChangeText={setLabel}
          placeholder="Or type a name"
          placeholderTextColor={palette.muted}
          maxLength={30}
          className={inputClass}
        />
      </View>

      <View className="gap-2">
        <Text variant="label" nativeID="pan-number">
          PAN
        </Text>
        <TextInput
          accessibilityLabelledBy="pan-number"
          value={pan}
          onChangeText={(t) => setPan(t.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          placeholder="ABCDE1234F"
          placeholderTextColor={palette.muted}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          maxLength={10}
          className={`${inputClass} font-sans-semibold tracking-widest`}
        />
      </View>

      <View className="gap-2 rounded-2xl border border-rim bg-canvas p-3 dark:border-rim-dark dark:bg-canvas-dark">
        <Text variant="caption" className="leading-4">
          Your PAN is used only to fill the PAN box on the registrar&apos;s allotment page. It is stored encrypted on
          this device and is never sent to IPOLens servers. You can delete it any time in Settings.
        </Text>
        <CheckRow
          label="I agree to store this PAN on this device"
          checked={consent}
          onToggle={() => setConsent((c) => !c)}
        />
      </View>

      {error ? (
        <Text accessibilityRole="alert" className="font-sans-medium text-sm text-loss dark:text-loss-dark">
          {error}
        </Text>
      ) : null}

      <Button
        label={submitLabel}
        onPress={save}
        busy={busy}
        disabled={!consent || pan.length !== 10 || !label.trim()}
      />
    </View>
  );
}
