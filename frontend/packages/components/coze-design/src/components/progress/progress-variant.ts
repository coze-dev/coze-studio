import { cva, type VariantProps } from 'class-variance-authority';

const progressVariants = cva(['coz-progress'], {
  variants: {
    type: {
      line: ['coz-progress-line'],
      circle: ['coz-progress-circle'],
    },
  },
  compoundVariants: [],
  defaultVariants: {
    type: 'line',
  },
});

export type ProgressProps = VariantProps<typeof progressVariants>;

export { progressVariants };
