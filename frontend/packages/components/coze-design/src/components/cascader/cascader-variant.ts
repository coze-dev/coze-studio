import { cva, type VariantProps } from 'class-variance-authority';

const cascaderVariants = cva(
  [
    'coz-cascader',
    'bg-transparent',
    'text-foreground-3',
    'hover:bg-background-5',
    'active:bg-background-6',
    'hover:coz-mg-secondary-hovered',

    'coz-stroke-plus',
    'hover:coz-stroke-plus',
    'active:coz-stroke-hglt',
  ],
  {
    variants: {
      disabled: {
        true: ['cursor-not-allowed', 'opacity-50'],
        false: [],
      },
      hasError: {
        true: [
          'border-red-6',
          // 'text-red-6',
          // 'placeholder-red-6::placeholder',
        ],
        false: [],
      },
      size: {
        default: [],
        small: [],
      },
    },
    compoundVariants: [],
    defaultVariants: {
      hasError: false,
      size: 'default',
      // checked: false,
      // loading: false,
      disabled: false,
    },
  },
);

export type CascaderVariantProps = VariantProps<typeof cascaderVariants>;

export { cascaderVariants };
