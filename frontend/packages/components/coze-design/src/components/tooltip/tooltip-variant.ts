import { cva, type VariantProps } from 'class-variance-authority';

export const tooltipVariant = cva(['coz-tooltip'], {
  variants: {
    theme: {
      light: ['coz-tooltip-light'],
      dark: ['coz-tooltip-dark'],
      system: [],
    },
  },
  defaultVariants: {
    theme: 'light',
  },
});

export type TooltipVariantProps = VariantProps<typeof tooltipVariant>;
