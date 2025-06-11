import { cva, type VariantProps } from 'class-variance-authority';

const popconfirmVariants = cva(['coz-popconfirm'], {
  variants: {},
  compoundVariants: [],
  defaultVariants: {},
});

export type PopconfirmVariantProps = VariantProps<typeof popconfirmVariants>;

export { popconfirmVariants };
