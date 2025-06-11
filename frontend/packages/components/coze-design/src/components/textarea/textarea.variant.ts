import { cva } from 'class-variance-authority';

export const textareaVariants = cva(
  [
    'coz-textarea',
    'w-full',
    'bg-transparent',
    'hover:bg-background-5',
    'active:bg-background-6',
    'p-[3px]',
  ],
  {
    variants: {
      error: {
        true: ['coz-textarea-error', 'coz-stroke-hglt-red'],
        false: [],
      },
      disabled: {
        false: [],
        true: ['hover:bg-transparent', 'active:bg-transparent'],
      },
    },
  },
);

export const textareaWrapperVariants = cva([
  'coz-textarea-wrapper',
  'relative',
  'w-full',
]);
