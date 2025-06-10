import { cva, type VariantProps } from 'class-variance-authority';

const emptyStateVariants = cva(['coz-empty-state'], {
  variants: {
    size: {
      full_screen: ['coz-empty-state-full_screen'],
      large: ['coz-empty-state-large', 'max-w-[240px]'],
      default: ['coz-empty-state-default', 'max-w-[180px]'],
    },
  },
  compoundVariants: [],
  defaultVariants: {
    size: 'default',
  },
});

export type EmptyStateProps = VariantProps<typeof emptyStateVariants>;

export { emptyStateVariants };
