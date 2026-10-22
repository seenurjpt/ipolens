import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';

import { Loading } from '../screen-state';
import type { SubscriptionChartProps } from './chart';

// Skia runs on CanvasKit in the browser; load it (public/canvaskit.wasm) before the chart.
export function SubscriptionChart(props: SubscriptionChartProps) {
  return (
    <WithSkiaWeb
      opts={{ locateFile: (file: string) => `/${file}` }}
      getComponent={() => import('./chart')}
      componentProps={props}
      fallback={<Loading />}
    />
  );
}
