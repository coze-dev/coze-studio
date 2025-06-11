import { cva } from 'class-variance-authority';

const datePickerInputIconVariants = cva(['coz-fg-primary', 'ml-8px'], {
  variants: {
    size: {
      default: ['w-3.5', 'h-3.5'],
      small: ['w-3', 'h-3'],
    },
  },
});

const datePickerDayVariants = cva(
  [
    'coz-date-picker-day',
    'w-8',
    'h-6',
    'flex',
    'items-center',
    'justify-center',
  ],
  {
    variants: {
      isInRange: {
        true: [],
        false: [],
      },
      isHover: {
        true: [],
        false: [],
      },
      isToday: {
        true: [],
        false: [],
      },
      isDisabled: {
        true: ['cursor-not-allowed'],
        false: [],
      },
    },
    compoundVariants: [
      {
        isDisabled: true,
        isInRange: [true, false],
        isHover: [true, false],
        className: ['bg-transparent'],
      },
      {
        isDisabled: false,
        isInRange: true,
        className: ['coz-mg-hglt-plus-dim'],
      },
      {
        isDisabled: false,
        isHover: true,
        className: ['coz-mg-hglt-plus-dim'],
      },
    ],
  },
);

const datePickerDayContentVariants = cva(
  [
    'coz-date-picker-day-content',
    'w-6',
    'h-6',
    'flex',
    'items-center',
    'justify-center',
    'rounded-lg',
  ],
  {
    variants: {
      isInRange: {
        true: ['hover:bg-transparent'],
        false: [],
      },
      isHover: {
        true: ['hover:bg-transparent'],
        false: [],
      },
      isToday: {
        true: ['font-medium'],
        false: [],
      },
      isSelected: {
        true: [
          'coz-fg-hglt-plus',
          'coz-mg-hglt-plus',
          'hover:coz-mg-hglt-plus-hovered',
          'active:coz-mg-hglt-plus-pressed',
        ],
        false: [],
      },
      isDisabled: { true: [], false: [] },
    },
    compoundVariants: [
      {
        isToday: true,
        isSelected: true,
        className: ['coz-fg-hglt-plus'],
      },
      {
        isToday: true,
        isSelected: false,
        className: ['coz-fg-hglt'],
      },
      {
        isDisabled: false,
        isHover: false,
        isInRange: false,
        isSelected: false,
        className: [
          'hover:coz-mg-primary-hovered',
          'active:coz-mg-primary-pressed',
        ],
      },
      {
        isDisabled: false,
        isHover: false,
        isInRange: false,
        isSelected: false,
        isToday: false,
        className: ['coz-fg-primary'],
      },
      {
        isDisabled: true,
        isToday: true,
        className: ['coz-fg-hglt-dim'],
      },
      {
        isDisabled: true,
        isToday: false,
        className: ['coz-fg-dim'],
      },
    ],
  },
);

export {
  datePickerInputIconVariants,
  datePickerDayVariants,
  datePickerDayContentVariants,
};
