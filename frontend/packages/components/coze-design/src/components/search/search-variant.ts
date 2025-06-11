import { cva, type VariantProps } from 'class-variance-authority';

const searchVariants = cva(['coz-search'], {
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

export type SearchProps = VariantProps<typeof searchVariants>;

export { searchVariants };
