import { cva } from 'class-variance-authority';

export const inputNumberVariants = cva(['coz-input-number'], {
  variants: {
    error: {
      false: [],
      true: ['coz-input-number-error'],
    },
    focus: {
      false: [],
      true: ['coz-input-number-focus'],
    },
  },
});

export const inputNumberButtonVariants = cva([
  'coz-input-number-button',
  'flex',
  'gap-1',
]);

export const inputNumberSuffixVariants = cva([
  'coz-input-number-suffix',
  'flex',
  'items-center',
  'gap-1',
  'text-xs',
  'text-foreground-2',
]);

export const inputNumberSuffixContentVariants = cva(['mx-1']);
