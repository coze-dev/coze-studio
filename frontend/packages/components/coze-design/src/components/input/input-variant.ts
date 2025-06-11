import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  [
    'coz-input',
    'bg-transparent',
    'hover:bg-background-5',
    'active:bg-background-6',
  ],
  {
    variants: {
      error: {
        true: [
          'coz-input-error',
          'coz-stroke-hglt-red',
          'hover:coz-stroke-hglt-red',
          'active:coz-stroke-hglt-red',
        ],
        false: [],
      },
      disabled: {
        false: [],
        true: ['hover:bg-transparent', 'active:bg-transparent'],
      },
    },
  },
);
