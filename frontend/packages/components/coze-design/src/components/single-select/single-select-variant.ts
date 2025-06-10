import { cva, type VariantProps } from 'class-variance-authority';

const singleSelectVariants = cva(['coz-single-select'], {
  variants: {
    layout: {
      fill: ['coz-single-select-fill'],
      hug: [],
    },
    size: {
      small: ['coz-single-select-small'],
      default: [],
      large: [],
    },
  },
  compoundVariants: [],
  defaultVariants: {
    layout: 'hug',
    size: 'default',
  },
});

export type SingleSelectProps = VariantProps<typeof singleSelectVariants>;

export { singleSelectVariants };
