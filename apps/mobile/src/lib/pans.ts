import { PanNumber } from '@ipolens/shared';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

import { securePanStorage } from './secure-pan-storage';
import { newId, useAppStore } from './store';

export class PanError extends Error {}

/**
 * Asks for the device biometric or screen lock when the user has turned the PAN lock on.
 * Resolves true when access is allowed.
 */
export async function unlockPans(reason: string): Promise<boolean> {
  if (!useAppStore.getState().biometricLock || Platform.OS === 'web') return true;
  const result = await LocalAuthentication.authenticateAsync({ promptMessage: reason });
  return result.success;
}

/** True when this device can protect PANs with a fingerprint, face or screen lock. */
export async function canUseBiometricLock(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  return (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
}

/** Validates and saves a PAN on this device. Returns the new PAN's id. */
export async function addPan(label: string, raw: string): Promise<string> {
  const parsed = PanNumber.safeParse(raw.trim());
  if (!parsed.success) throw new PanError('Enter a valid PAN, like ABCDE1234F');
  const pan = parsed.data;
  const name = label.trim();
  if (!name) throw new PanError('Give this PAN a name, like Self or Mom');

  const { pans, addPanMeta } = useAppStore.getState();
  if (pans.some((p) => p.label.toLowerCase() === name.toLowerCase())) {
    throw new PanError(`You already have a PAN named "${name}"`);
  }
  for (const p of pans) {
    if ((await securePanStorage.get(p.id)) === pan) throw new PanError(`This PAN is already saved as "${p.label}"`);
  }

  const id = newId();
  await securePanStorage.set(id, pan);
  addPanMeta({ id, label: name, last4: pan.slice(-4), createdAt: new Date().toISOString() });
  return id;
}

/** The full PAN, after the lock check. Null when the user cancels or it is missing. */
export async function revealPan(panId: string, reason: string): Promise<string | null> {
  if (!(await unlockPans(reason))) return null;
  return securePanStorage.get(panId);
}

/** Deletes the PAN and every application recorded against it. */
export async function removePan(panId: string): Promise<void> {
  await securePanStorage.remove(panId);
  useAppStore.getState().removePanMeta(panId);
}

/** Deletes everything this app stores on the device (SPEC: Compliance > delete data). */
export async function deleteAllData(): Promise<void> {
  const { pans, reset } = useAppStore.getState();
  await Promise.all(pans.map((p) => securePanStorage.remove(p.id)));
  reset();
}

export const maskPan = (last4: string) => `•••••${last4}`;
