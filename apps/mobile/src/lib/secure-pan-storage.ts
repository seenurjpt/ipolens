import * as SecureStore from 'expo-secure-store';

// Full PAN numbers live only here: the Android Keystore / iOS Keychain via expo-secure-store,
// never in plain app storage and never sent to the server (SPEC: Compliance > on-device option).

const key = (panId: string) => `pan.${panId}`;

export const securePanStorage = {
  get: (panId: string) => SecureStore.getItemAsync(key(panId)),
  set: (panId: string, pan: string) => SecureStore.setItemAsync(key(panId), pan),
  remove: (panId: string) => SecureStore.deleteItemAsync(key(panId)),
};
