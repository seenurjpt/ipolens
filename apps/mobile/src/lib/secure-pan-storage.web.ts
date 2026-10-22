// Browsers have no keystore. The web build is a development preview, so PANs fall back to
// localStorage there; the Android app uses expo-secure-store (secure-pan-storage.ts).

const key = (panId: string) => `pan.${panId}`;

export const securePanStorage = {
  get: async (panId: string) => localStorage.getItem(key(panId)),
  set: async (panId: string, pan: string) => localStorage.setItem(key(panId), pan),
  remove: async (panId: string) => localStorage.removeItem(key(panId)),
};
