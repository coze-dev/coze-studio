import { cva, type VariantProps } from 'class-variance-authority';

const selectVariants = cva(['coz-select', 'border-stroke'], {
  variants: {
    disabled: {
      true: ['cursor-not-allowed', 'opacity-50'],
      false: [],
    },
    hasError: {
      true: ['border-red-6'],
      false: [],
    },
    size: {
      default: [],
      small: [],
      large: [],
    },
    showTick: {
      true: [],
      false: [],
    },
  },
  compoundVariants: [],
  defaultVariants: {
    hasError: false,
    size: 'default',
    showTick: true,
  },
});

export type SelectVariantProps = VariantProps<typeof selectVariants>;

export { selectVariants };
