import { Text as RNText, type TextProps } from 'react-native';

type Variant = 'body' | 'label' | 'title' | 'heading' | 'caption';

const INK = 'text-ink dark:text-ink-dark';
const MUTED = 'text-muted dark:text-muted-dark';

const VARIANTS: Record<Variant, { font: string; size: string; color: string }> = {
  heading: { font: 'font-sans-bold', size: 'text-xl', color: INK },
  title: { font: 'font-sans-semibold', size: 'text-base', color: INK },
  body: { font: 'font-sans', size: 'text-sm', color: INK },
  label: { font: 'font-sans-medium', size: 'text-sm', color: INK },
  caption: { font: 'font-sans', size: 'text-xs', color: MUTED },
};

// Two classes for the same property (e.g. dark:text-ink-dark and dark:text-canvas-dark) don't
// resolve by order on web, so the variant's class is dropped whenever the caller sets its own.
const SETS_COLOR = /(^|\s)(dark:)?text-(white|black|canvas|surface|line|ink|muted|brand|over|under|loss)\b/;
const SETS_SIZE = /(^|\s)text-(xs|sm|base|lg|xl|\dxl|\[)/;
const SETS_FONT = /(^|\s)font-sans/;

/** App text: Inter, themed for light and dark. Extra classes override the variant's. */
export function Text({ variant = 'body', className = '', ...props }: TextProps & { variant?: Variant; className?: string }) {
  const v = VARIANTS[variant];
  const base = [
    SETS_FONT.test(className) ? '' : v.font,
    SETS_SIZE.test(className) ? '' : v.size,
    SETS_COLOR.test(className) ? '' : v.color,
  ].join(' ');
  return <RNText className={`${base} ${className}`} {...props} />;
}
