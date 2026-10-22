import { Text } from './ui/text';

/** One-line disclaimer for detail and report screens; the full text lives in Settings. */
export function Disclaimer() {
  return (
    <Text variant="caption" className="px-4 py-3 text-center">
      For information only, not investment advice. IPOLens is not SEBI-registered.
    </Text>
  );
}
