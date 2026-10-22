import { z } from 'zod';

// allotmentUrl and the PAN field selector are added with the allotment WebView (Prompt 5).
export const RegistrarCode = z.enum(['KFIN', 'MUFG_INTIME', 'BIGSHARE', 'SKYLINE', 'CAMEO', 'PURVA', 'MAASHITLA']);
export type RegistrarCode = z.infer<typeof RegistrarCode>;

export const REGISTRARS: Record<RegistrarCode, { name: string }> = {
  KFIN: { name: 'KFin Technologies' },
  MUFG_INTIME: { name: 'MUFG Intime (formerly Link Intime)' },
  BIGSHARE: { name: 'Bigshare Services' },
  SKYLINE: { name: 'Skyline Financial Services' },
  CAMEO: { name: 'Cameo Corporate Services' },
  PURVA: { name: 'Purva Sharegistry' },
  MAASHITLA: { name: 'Maashitla Securities' },
};
