import { cva, type VariantProps } from 'class-variance-authority';

const paginationVariants = cva(['coz-pagination'], {
  variants: {
    size: {
      default: ['coz-pagination-size-default'],
      small: ['coz-pagination-size-small'],
    },
    layout: {
      default: ['coz-pagination-layout-default'],
      simple: ['coz-pagination-layout-simple'],
    },
  },
  compoundVariants: [],
  defaultVariants: {
    size: 'default',
    layout: 'default',
  },
});

export type PaginationVariantProps = VariantProps<typeof paginationVariants>;

export { paginationVariants };
