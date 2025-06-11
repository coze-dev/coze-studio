import { cva, type VariantProps } from 'class-variance-authority';

const layoutVariants = cva(['coz-layout'], {
  variants: {
    size: {
      small: ['text-base'],
      default: ['text-lg'],
    },
  },
  compoundVariants: [],
  defaultVariants: {
    size: 'default',
  },
});

export type LayoutProps = VariantProps<typeof layoutVariants>;

export { layoutVariants };
