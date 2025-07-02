import { cva, type VariantProps } from 'class-variance-authority';

const shortcutCommandVariants = cva(
  [
    'mr-8px',
    'rounded-[99px]',
    'border-[1px]',
    'border-solid',
    'overflow-hidden',
  ],
  {
    variants: {
      color: {
        grey: [
          'coz-stroke-primary',
          'coz-mg-secondary',
          'backdrop-blur-[3.45px]',
        ],
        white: ['coz-stroke-primary', 'coz-bg-max', 'backdrop-blur-[3.45px]'],
        blur: [
          'coz-stroke-image-bots',
          'coz-bg-image-bots',
          'backdrop-blur-[20px]',
        ],
      },
    },
  },
);

const shortcutCommandTextVariants = cva(['text-lg', 'font-medium'], {
  variants: {
    color: {
      grey: ['coz-fg-primary'],
      white: ['coz-fg-primary'],
      blur: ['coz-fg-images-bots'],
    },
  },
});

export const typeSafeShortcutCommandVariants: (
  props: Required<VariantProps<typeof shortcutCommandVariants>>,
) => string = shortcutCommandVariants;

export const typeSafeShortcutCommandTextVariants: (
  props: Required<VariantProps<typeof shortcutCommandTextVariants>>,
) => string = shortcutCommandTextVariants;
