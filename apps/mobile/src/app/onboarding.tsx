import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Notifications from 'expo-notifications';
import { Redirect } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PanForm } from '@/components/pan-form';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAppStore } from '@/lib/store';
import { usePalette } from '@/lib/theme';

type Icon = ComponentProps<typeof MaterialCommunityIcons>['name'];

const SLIDES: { icon: Icon; title: string; body: string }[] = [
  {
    icon: 'chart-timeline-variant',
    title: 'Every IPO, live',
    body: 'Mainboard and SME issues with dates, price bands and live subscription by category, straight from NSE and BSE.',
  },
  {
    icon: 'file-search-outline',
    title: 'Read the RHP in minutes',
    body: 'An analysis score built from the offer document, where every point links back to the page it came from.',
  },
  {
    icon: 'account-group-outline',
    title: 'Your whole family, one place',
    body: "Track applications across everyone's PANs, check allotment in a tap and see listing-day gains.",
  },
];

// Steps: the slides, then notifications, then an optional first PAN.
const NOTIFY_STEP = SLIDES.length;
const PAN_STEP = SLIDES.length + 1;

export default function OnboardingScreen() {
  const onboarded = useAppStore((s) => s.onboarded);
  const finish = useAppStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);

  if (onboarded) return <Redirect href="/home" />;

  const askNotifications = async () => {
    try {
      if (Platform.OS !== 'web') await Notifications.requestPermissionsAsync();
    } finally {
      setStep(PAN_STEP);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-canvas dark:bg-canvas-dark">
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, gap: 24 }} keyboardShouldPersistTaps="handled">
        <View className="flex-row items-center justify-between">
          <Text className="font-sans-bold text-lg">IPOLens</Text>
          {step < PAN_STEP ? (
            <Button label="Skip" variant="ghost" onPress={finish} />
          ) : null}
        </View>

        {step < NOTIFY_STEP ? (
          <Slide {...SLIDES[step]!} />
        ) : step === NOTIFY_STEP ? (
          <Slide
            icon="bell-ring-outline"
            title="Never miss a closing day"
            body="Get an alert when an IPO opens, on its last day, when allotment is out and on listing day. You can change these any time in Settings."
          />
        ) : (
          <View className="flex-1 gap-4">
            <View className="gap-2">
              <Text variant="heading">Add your first PAN</Text>
              <Text variant="caption" className="text-sm leading-5">
                Optional. It makes checking allotment one tap. You can add family members later.
              </Text>
            </View>
            <PanForm onSaved={finish} submitLabel="Save and finish" />
          </View>
        )}

        <View className="mt-auto gap-4">
          {step < PAN_STEP ? (
            <View className="flex-row justify-center gap-2" accessibilityLabel={`Step ${step + 1} of ${PAN_STEP + 1}`}>
              {Array.from({ length: PAN_STEP + 1 }, (_, i) => (
                <View
                  key={i}
                  className={`h-1.5 rounded-full ${i === step ? 'w-6 bg-brand dark:bg-brand-dark' : 'w-1.5 bg-line dark:bg-line-dark'}`}
                />
              ))}
            </View>
          ) : null}
          {step < NOTIFY_STEP ? <Button label="Next" onPress={() => setStep(step + 1)} /> : null}
          {step === NOTIFY_STEP ? (
            <>
              <Button label="Turn on alerts" onPress={askNotifications} />
              <Button label="Not now" variant="ghost" onPress={() => setStep(PAN_STEP)} />
            </>
          ) : null}
          {step === PAN_STEP ? <Button label="Skip for now" variant="ghost" onPress={finish} /> : null}
          <Text variant="caption" className="text-center">
            For information only, not investment advice.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Slide({ icon, title, body }: { icon: Icon; title: string; body: string }) {
  const palette = usePalette();
  return (
    <View className="flex-1 items-center justify-center gap-5 py-8">
      <View className="h-24 w-24 items-center justify-center rounded-3xl bg-brand-soft dark:bg-brand-soft-dark">
        <MaterialCommunityIcons name={icon} size={44} color={palette.brand} />
      </View>
      <Text className="text-center font-sans-bold text-2xl">{title}</Text>
      <Text variant="caption" className="max-w-sm text-center text-base leading-6">
        {body}
      </Text>
    </View>
  );
}
