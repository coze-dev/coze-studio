import { cva, type VariantProps } from 'class-variance-authority';

const fileCardVariants = cva(
  [
    'select-none',
    'relative',
    'overflow-hidden',
    'flex',
    'flex-row',
    'items-center',
    'box-border',
    'p-12px',
    'border-[1px]',
    'border-solid',
    'rounded-normal',
    'coz-mg-card',
    'w-full',
  ],
  {
    variants: {
      layout: {
        pc: ['min-w-[282px]', 'max-w-[320px]'],
        mobile: ['w-full'],
      },
      isError: {
        true: ['coz-stroke-hglt-red'],
        false: ['coz-stroke-primary'],
      },
      showBackground: {
        true: ['!coz-bg-image-bots', '!coz-stroke-image-bots'],
        false: [],
      },
    },
    compoundVariants: [
      {
        showBackground: true,
        isError: false,
        className: [],
      },
    ],
  },
);

const fileCardNameVariants = cva(['text-lg', 'font-normal', 'leading-[20px]'], {
  variants: {
    layout: {
      pc: ['w-[180px]'],
      mobile: ['w-full', 'max-w-[calc(100vw-170px)]'],
    },
    isCanceled: {
      true: ['coz-fg-dim'],
      false: ['coz-fg-primary'],
    },
  },
});

export const typeSafeFileCardVariants: (
  props: Required<VariantProps<typeof fileCardVariants>>,
) => string = fileCardVariants;

export const typeSafeFileCardNameVariants: (
  props: Required<VariantProps<typeof fileCardNameVariants>>,
) => string = fileCardNameVariants;
