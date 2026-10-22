import { z } from 'zod';

export const RegistrarCode = z.enum(['KFIN', 'MUFG_INTIME', 'BIGSHARE', 'SKYLINE', 'CAMEO', 'PURVA', 'MAASHITLA']);
export type RegistrarCode = z.infer<typeof RegistrarCode>;

export interface RegistrarInfo {
  name: string;
  /** Public allotment status page the app opens in its WebView. */
  allotmentUrl: string;
  /** Hosts the allotment WebView may load (SPEC: Compliance > Google Play). */
  allowedHosts: string[];
  /**
   * CSS selector of the PAN input on the allotment page. Unset until checked against the
   * live page (Prompt 5); the WebView then leaves the PAN for the user to type.
   */
  panFieldSelector?: string;
}

// URLs change without notice. Verify each against the live site before release.
export const REGISTRARS: Record<RegistrarCode, RegistrarInfo> = {
  KFIN: {
    name: 'KFin Technologies',
    allotmentUrl: 'https://ipostatus.kfintech.com/',
    allowedHosts: ['ipostatus.kfintech.com'],
  },
  MUFG_INTIME: {
    name: 'MUFG Intime (formerly Link Intime)',
    allotmentUrl: 'https://in.mpms.mufg.com/Initial_Offer/public-issues.html',
    allowedHosts: ['in.mpms.mufg.com'],
  },
  BIGSHARE: {
    name: 'Bigshare Services',
    allotmentUrl: 'https://ipo.bigshareonline.com/IPO_Status.html',
    allowedHosts: ['ipo.bigshareonline.com'],
  },
  SKYLINE: {
    name: 'Skyline Financial Services',
    allotmentUrl: 'https://www.skylinerta.com/ipo.php',
    allowedHosts: ['www.skylinerta.com', 'skylinerta.com'],
  },
  CAMEO: {
    name: 'Cameo Corporate Services',
    allotmentUrl: 'https://ipo.cameoindia.com/',
    allowedHosts: ['ipo.cameoindia.com'],
  },
  PURVA: {
    name: 'Purva Sharegistry',
    allotmentUrl: 'https://www.purvashare.com/investor-service/ipo-query',
    allowedHosts: ['www.purvashare.com', 'purvashare.com'],
  },
  MAASHITLA: {
    name: 'Maashitla Securities',
    allotmentUrl: 'https://maashitla.com/allotment-status/public-issues',
    allowedHosts: ['maashitla.com', 'www.maashitla.com'],
  },
};
