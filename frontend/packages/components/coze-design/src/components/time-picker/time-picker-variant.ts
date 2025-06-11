import { cva } from 'class-variance-authority';

const timePickerVariants = cva('coz-time-picker', {
  variants: {
    size: {
      default: ['h-8'],
      small: ['h-6'],
      large: ['h-10'],
    },
  },
});

const timePickerInputVariants = cva(
  ['coz-time-picker-input', 'text-foreground-4'],
  {
    variants: {
      disabled: {
        false: ['hover:bg-background-5', 'active:bg-background-6'],
        true: ['cursor-not-allowed'],
      },
      size: {
        default: ['h-8'],
        small: ['h-6', 'text-xs'],
        large: ['h-10'],
      },
    },
  },
);

const timePickerInputIconVariants = cva([], {
  variants: {
    disabled: {
      false: ['text-foreground-4'],
      true: ['text-foreground-1'],
    },
    size: {
      default: ['w-3.5', 'h-3.5'],
      small: ['w-3', 'h-3'],
      large: [],
    },
  },
});

export {
  timePickerInputVariants,
  timePickerInputIconVariants,
  timePickerVariants,
};
