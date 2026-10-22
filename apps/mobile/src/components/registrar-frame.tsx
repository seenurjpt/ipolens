import { useMemo } from 'react';
import { WebView } from 'react-native-webview';

import { Loading } from './screen-state';

export interface RegistrarFrameProps {
  url: string;
  allowedHosts: string[];
  /** CSS selector of the PAN box; when known, the PAN is filled in for the user. */
  panFieldSelector?: string;
  pan: string;
}

/**
 * The registrar's allotment page, loaded on the user's phone (SPEC: Compliance > Google Play):
 * only allow-listed registrar hosts may load, and the injected script only fills the PAN box.
 * It never reads the result or the CAPTCHA.
 */
export function RegistrarFrame({ url, allowedHosts, panFieldSelector, pan }: RegistrarFrameProps) {
  const fillPan = useMemo(() => {
    if (!panFieldSelector) return undefined;
    return `(function () {
      var el = document.querySelector(${JSON.stringify(panFieldSelector)});
      if (el) {
        el.value = ${JSON.stringify(pan)};
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })(); true;`;
  }, [panFieldSelector, pan]);

  return (
    <WebView
      source={{ uri: url }}
      originWhitelist={['https://*']}
      onShouldStartLoadWithRequest={(req) => {
        try {
          const { protocol, hostname } = new URL(req.url);
          return protocol === 'https:' && allowedHosts.includes(hostname);
        } catch {
          return false;
        }
      }}
      injectedJavaScript={fillPan}
      startInLoadingState
      renderLoading={() => <Loading />}
      setSupportMultipleWindows={false}
      javaScriptCanOpenWindowsAutomatically={false}
      incognito
    />
  );
}
