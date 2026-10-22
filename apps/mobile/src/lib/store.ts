import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AlertType, AllotmentResult, ApplicationCategory } from '@ipolens/shared';
import { useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// On-device app state. Nothing here is sensitive: full PANs are kept in secure storage
// (secure-pan-storage.ts) and only their label and last 4 characters live here.
// Sign-in (Prompt 5) will sync applications and alert preferences to the server.

export interface SavedPan {
  id: string;
  label: string;
  last4: string;
  createdAt: string;
}

export interface Application {
  id: string;
  ipoId: string;
  slug: string;
  panId: string;
  category: ApplicationCategory;
  lots: number;
  allotment: AllotmentResult;
  sharesAllotted?: number;
  markedAt: string;
}

export type ThemePreference = 'system' | 'light' | 'dark';

// Defaults from SPEC: Notifications.
export const DEFAULT_ALERTS: Record<AlertType, boolean> = {
  NEW_IPO: true,
  OPEN: true,
  LAST_DAY: true,
  SUB_MILESTONE: false,
  ALLOTMENT_OUT: true,
  LISTING: true,
};

interface AppState {
  onboarded: boolean;
  theme: ThemePreference;
  biometricLock: boolean;
  pans: SavedPan[];
  applications: Application[];
  alerts: Record<AlertType, boolean>;
  followed: string[]; // IPO slugs

  completeOnboarding: () => void;
  setTheme: (theme: ThemePreference) => void;
  setBiometricLock: (on: boolean) => void;
  addPanMeta: (pan: SavedPan) => void;
  removePanMeta: (panId: string) => void;
  /** Replaces this IPO's applications with one per selected PAN, keeping known results. */
  saveApplications: (
    ipo: { ipoId: string; slug: string },
    entries: { panId: string; category: ApplicationCategory; lots: number }[],
  ) => void;
  setAllotment: (applicationId: string, allotment: AllotmentResult, sharesAllotted?: number) => void;
  setAlert: (type: AlertType, on: boolean) => void;
  toggleFollow: (slug: string) => void;
  reset: () => void;
}

const initial = {
  onboarded: false,
  theme: 'system' as ThemePreference,
  biometricLock: false,
  pans: [] as SavedPan[],
  applications: [] as Application[],
  alerts: DEFAULT_ALERTS,
  followed: [] as string[],
};

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initial,

      completeOnboarding: () => set({ onboarded: true }),
      setTheme: (theme) => set({ theme }),
      setBiometricLock: (biometricLock) => set({ biometricLock }),

      addPanMeta: (pan) => set((s) => ({ pans: [...s.pans, pan] })),
      removePanMeta: (panId) =>
        set((s) => ({
          pans: s.pans.filter((p) => p.id !== panId),
          applications: s.applications.filter((a) => a.panId !== panId),
        })),

      saveApplications: (ipo, entries) =>
        set((s) => {
          const others = s.applications.filter((a) => a.ipoId !== ipo.ipoId);
          const existing = new Map(s.applications.filter((a) => a.ipoId === ipo.ipoId).map((a) => [a.panId, a]));
          const mine = entries.map((e) => {
            const prev = existing.get(e.panId);
            return {
              id: prev?.id ?? newId(),
              ipoId: ipo.ipoId,
              slug: ipo.slug,
              panId: e.panId,
              category: e.category,
              lots: e.lots,
              allotment: prev?.allotment ?? 'UNKNOWN',
              sharesAllotted: prev?.sharesAllotted,
              markedAt: prev?.markedAt ?? new Date().toISOString(),
            } satisfies Application;
          });
          return { applications: [...others, ...mine] };
        }),

      setAllotment: (applicationId, allotment, sharesAllotted) =>
        set((s) => ({
          applications: s.applications.map((a) =>
            a.id === applicationId
              ? { ...a, allotment, sharesAllotted: allotment === 'ALLOTTED' ? sharesAllotted : undefined }
              : a,
          ),
        })),

      setAlert: (type, on) => set((s) => ({ alerts: { ...s.alerts, [type]: on } })),
      toggleFollow: (slug) =>
        set((s) => ({
          followed: s.followed.includes(slug) ? s.followed.filter((x) => x !== slug) : [...s.followed, slug],
        })),

      reset: () => set(initial),
    }),
    { name: 'ipolens-app', storage: createJSONStorage(() => AsyncStorage), version: 1 },
  ),
);

/** False until the persisted state has been read back from storage. */
export const useStoreHydrated = () =>
  useSyncExternalStore(
    (onChange) => useAppStore.persist.onFinishHydration(onChange),
    () => useAppStore.persist.hasHydrated(),
    () => false,
  );
