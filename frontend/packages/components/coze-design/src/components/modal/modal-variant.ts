import { cva, type VariantProps } from 'class-variance-authority';

const modalVariants = cva(['coz-modal'], {
  variants: {},
  compoundVariants: [],
  defaultVariants: {},
});

export type ModalVariantProps = VariantProps<typeof modalVariants>;

export { modalVariants };
