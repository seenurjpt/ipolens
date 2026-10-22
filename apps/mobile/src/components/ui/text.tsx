import { Text as RNText, type TextProps } from 'react-native';

type Variant = 'body' | 'label' | 'title' | 'heading' | 'caption';

const VARIANTS: Record<Variant, string> = {
  heading: 'font-sans-bold text-xl text-ink dark:text-ink-dark',
  title: 'font-sans-semibold text-base text-ink dark:text-ink-dark',
  body: 'font-sans text-sm text-ink dark:text-ink-dark',
  label: 'font-sans-medium text-sm text-ink dark:text-ink-dark',
  caption: 'font-sans text-xs text-muted dark:text-muted-dark',
};

/** App text: Inter, themed for light and dark. Extra classes are appended and win. */
export function Text({ variant = 'body', className, ...props }: TextProps & { variant?: Variant; className?: string }) {
  return <RNText className={`${VARIANTS[variant]} ${className ?? ''}`} {...props} />;
}
