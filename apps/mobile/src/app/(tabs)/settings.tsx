import Constants from 'expo-constants';
import { ScrollView } from 'react-native';

import { Card, Row } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

// Saved PANs, alert toggles, theme and language arrive with sign-in (Prompt 5).
export default function SettingsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
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
      <Card title="About">
        <Row label="Version" value={Constants.expoConfig?.version ?? '–'} />
        <Row label="Data" value="NSE, BSE, SEBI filings" />
      </Card>
    </ScrollView>
  );
}
