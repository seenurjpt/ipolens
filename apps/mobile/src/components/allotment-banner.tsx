import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { awaitsAllotmentCheck } from '@/lib/applications';
import { useIposBySlug } from '@/lib/queries';
import { useAppStore } from '@/lib/store';

import { HeroCard } from './glass/hero';
import { Text } from './ui/text';

/**
 * "Allotment out" for IPOs the user applied to and has not recorded a result for. Driven by
 * the IPO's status, so it never says "pending" once allotment is done.
 */
export function AllotmentBanner() {
  const applications = useAppStore((s) => s.applications);
  const slugs = useMemo(
    () => [...new Set(applications.filter((a) => a.allotment === 'UNKNOWN').map((a) => a.slug))],
    [applications],
  );
  const { bySlug } = useIposBySlug(slugs);

  const due = slugs.flatMap((slug) => {
    const ipo = bySlug.get(slug);
    return ipo && applications.some((a) => a.slug === slug && awaitsAllotmentCheck(a, ipo)) ? [ipo] : [];
  });
  if (due.length === 0) return null;

  return (
    <View className="gap-2">
      {due.map((ipo) => (
        <Link key={ipo.slug} href={{ pathname: '/allotment/[slug]', params: { slug: ipo.slug } }} asChild>
          <Pressable accessibilityRole="link" className="active:opacity-90">
            <HeroCard className="flex-row items-center gap-3 p-4">
              <MaterialCommunityIcons name="party-popper" size={24} color="#FFFFFF" />
              <View className="flex-1">
                <Text className="font-sans-semibold text-white">Allotment is out</Text>
                <Text className="text-xs text-white/85">{ipo.name} · tap to check your PANs</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#FFFFFF" />
            </HeroCard>
          </Pressable>
        </Link>
      ))}
    </View>
  );
}
