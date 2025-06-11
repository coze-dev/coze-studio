import { cva, type VariantProps } from 'class-variance-authority';

const inputCodeVariants = cva(['coz-input-code', 'flex', 'flex-row', 'gap-5'], {
  variants: {
    disabled: {
      true: ['cursor-not-allowed'],
      false: [],
    },
    error: {
      true: ['border-red-6'],
      false: [],
    },
  },
  compoundVariants: [],
  defaultVariants: {},
});

const inputVariants = cva(
  [
    'flex',
    'items-center',
    'justify-center',
    'w-10',
    'h-10',
    'rounded-[10px]',
    'border',
    'border-solid',
  ],
  {
    variants: {
      error: {
        true: ['border-red-5'],
        false: ['border-stroke'],
      },
    },
  },
);

const inputCodeDotVariants = cva([
  'w-12px',
  'h-12px',
  'rounded-full',
  'bg-foreground-3',
  'coz-fg-primary',
]);

export type InputCodeProps = VariantProps<typeof inputCodeVariants>;

export { inputCodeVariants, inputVariants, inputCodeDotVariants };
