import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';

/**
 * True when expo-notifications can load. Expo Go on Android dropped the push module in SDK 53,
 * and importing expo-notifications there throws, so the app skips it in Expo Go and only uses
 * it in a development or store build.
 */
export const notificationsSupported =
  Platform.OS !== 'web' &&
  !(Platform.OS === 'android' && Constants.executionEnvironment === ExecutionEnvironment.StoreClient);

/** Asks for permission to show alerts. Resolves false when unsupported or declined. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported) return false;
  // Loaded on demand so that merely opening the app never evaluates the module.
  const Notifications = await import('expo-notifications');
  const { granted } = await Notifications.requestPermissionsAsync();
  return granted;
}
