import { cva, type VariantProps } from 'class-variance-authority';

export const bannerVariant = cva(['coz-banner'], {
  variants: {
    type: {
      default: [],
      info: [],
      danger: [],
      warning: [],
      success: [],
    },
    card: {
      true: [],
      false: [],
    },

    justify: {
      start: 'coz-banner-content-start',
      center: 'coz-banner-content-center',
    },
  },
  compoundVariants: [
    {
      type: 'default',
      className: ['coz-banner-info'],
    },
    {
      type: 'info',
      className: ['coz-banner-info'],
    },
    {
      type: 'danger',
      className: ['coz-banner-danger'],
    },
    {
      type: 'warning',
      className: ['coz-banner-warning'],
    },
    {
      type: 'success',
      className: ['coz-banner-success'],
    },
    {
      card: true,
      className: ['coz-banner-card'],
    },
    {
      card: false,
      className: ['coz-banner-normal'],
    },
  ],
  defaultVariants: {
    type: 'default',
    card: false,
    justify: 'center',
  },
});

export type TooltipVariantProps = VariantProps<typeof bannerVariant>;
