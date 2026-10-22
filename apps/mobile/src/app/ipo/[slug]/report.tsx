import type { AiReport } from '@ipolens/shared';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ScoreBreakdown, ScoreRing } from '@/components/score';
import { Empty, ErrorState, Loading } from '@/components/screen-state';
import { Card, Row } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useReport } from '@/lib/queries';

type Point = AiReport['pros'][number];

export default function ReportScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const query = useReport(slug);

  if (query.isPending) return <Loading />;
  if (query.isError) return <ErrorState message={query.error.message} onRetry={() => query.refetch()} />;
  if (!query.data) return <Empty title="Analysis in progress" note="This report has not been published yet." />;
  const { report } = query.data;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Card>
        <View className="flex-row items-center gap-4">
          <ScoreRing total={report.score.total} size={104} />
          <View className="flex-1 gap-1">
            <Text variant="title">Analysis score</Text>
            <Text variant="caption">
              Each point comes from a figure in the offer document. It summarises the data and is not a rating.
            </Text>
          </View>
        </View>
        <ScoreBreakdown breakdown={report.score.breakdown} />
      </Card>

      <Card title="Summary">
        <Text className="leading-5">{report.summary}</Text>
      </Card>

      <Card title="Business">
        <Text className="leading-5">{report.business.model}</Text>
        {report.business.segments.length > 0 ? (
          <View className="flex-row flex-wrap gap-2">
            {report.business.segments.map((s) => (
              <View key={s} className="rounded-full bg-canvas px-3 py-1 dark:bg-canvas-dark">
                <Text variant="caption" className="text-ink dark:text-ink-dark">
                  {s}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
        {report.business.customers ? <Text variant="caption">{report.business.customers}</Text> : null}
      </Card>

      <Financials rows={report.financials} />

      <Points title="Strengths" points={report.pros} tone="over" />
      <Points title="Concerns" points={report.cons} tone="under" />
      <Points title="Key risks" points={report.risks} tone="loss" />

      <Card title="Valuation">
        {report.valuation.postIssuePe !== undefined ? (
          <Row label="Post-issue P/E" value={`${report.valuation.postIssuePe.toFixed(1)}x`} />
        ) : null}
        <Row label="Market cap at upper band" value={`₹${report.valuation.marketCapCr.toLocaleString('en-IN')} Cr`} />
        {report.valuation.peerPe.length > 0 ? (
          <View className="gap-2 border-t border-line pt-3 dark:border-line-dark">
            <Text variant="caption">Listed peers (P/E)</Text>
            {report.valuation.peerPe.map((p) => (
              <Row key={p.name} label={p.name} value={`${p.pe.toFixed(1)}x`} />
            ))}
          </View>
        ) : null}
      </Card>

      <Text variant="caption" className="px-2 text-center leading-4">
        For information only, not investment advice. IPOLens is not a SEBI-registered research analyst or investment
        adviser. Figures are taken from the offer document; check the page cited before relying on them. Disclaimer{' '}
        {report.disclaimerVersion}.
      </Text>
    </ScrollView>
  );
}

const FIN_COLUMNS: { key: keyof AiReport['financials'][number]; label: string; pct?: boolean }[] = [
  { key: 'revenueCr', label: 'Revenue' },
  { key: 'ebitdaCr', label: 'EBITDA' },
  { key: 'patCr', label: 'Profit (PAT)' },
  { key: 'netWorthCr', label: 'Net worth' },
  { key: 'debtCr', label: 'Debt' },
  { key: 'roePct', label: 'RoE', pct: true },
  { key: 'rocePct', label: 'RoCE', pct: true },
];

function Financials({ rows }: { rows: AiReport['financials'] }) {
  if (rows.length === 0) return null;
  return (
    <Card title="Financials" right={<Text variant="caption">₹ crore</Text>}>
      <View className="flex-row border-b border-line pb-2 dark:border-line-dark">
        <Text variant="caption" className="flex-1">
          {' '}
        </Text>
        {rows.map((r) => (
          <Text key={r.fy} variant="caption" className="w-16 text-right font-sans-semibold">
            {r.fy}
          </Text>
        ))}
      </View>
      {FIN_COLUMNS.map((c) => (
        <View key={c.key} className="flex-row">
          <Text variant="caption" className="flex-1 text-sm">
            {c.label}
          </Text>
          {rows.map((r) => {
            const v = r[c.key] as number;
            return (
              <Text key={r.fy} variant="label" className={`w-16 text-right ${v < 0 ? 'text-loss dark:text-loss-dark' : ''}`}>
                {c.pct ? `${v.toFixed(1)}%` : v.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </Text>
            );
          })}
        </View>
      ))}
    </Card>
  );
}

const TONE = {
  over: 'bg-over dark:bg-over-dark',
  under: 'bg-under dark:bg-under-dark',
  loss: 'bg-loss dark:bg-loss-dark',
} as const;

function Points({ title, points, tone }: { title: string; points: Point[]; tone: keyof typeof TONE }) {
  if (points.length === 0) return null;
  return (
    <Card title={title}>
      {points.map((p) => (
        <PointRow key={p.text} point={p} dot={TONE[tone]} />
      ))}
    </Card>
  );
}

/** A point with its evidence page; tapping the page chip shows the quoted line. */
function PointRow({ point, dot }: { point: Point; dot: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View className="flex-row gap-3">
      <View className={`mt-1.5 h-2 w-2 rounded-full ${dot}`} />
      <View className="flex-1 gap-1.5">
        <Text className="leading-5">{point.text}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Evidence on page ${point.evidence.page}`}
          onPress={() => setOpen((o) => !o)}
          className="self-start rounded-md bg-brand-soft px-2 py-0.5 active:opacity-70 dark:bg-brand-soft-dark">
          <Text className="font-sans-semibold text-[11px] text-brand dark:text-brand-dark">page {point.evidence.page}</Text>
        </Pressable>
        {open ? (
          <Text variant="caption" className="border-l-2 border-line pl-2 italic dark:border-line-dark">
            “{point.evidence.quote}”
          </Text>
        ) : null}
      </View>
    </View>
  );
}
