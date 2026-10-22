import { Text, View } from 'react-native';

// Temporary stand-in until each screen is built (Prompt 3 onwards).
export function PlaceholderScreen({ title, note }: { title: string; note?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-neutral-950">
      <Text className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">{title}</Text>
      {note ? <Text className="mt-2 text-center text-neutral-500">{note}</Text> : null}
    </View>
  );
}
