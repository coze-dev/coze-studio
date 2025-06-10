import { cva } from 'class-variance-authority';

const wrapper = cva(['coz-loading-wrapper'], {
  variants: {
    size: {
      small: [],
      normal: [],
      middle: [],
      large: [],
    },
  },
  compoundVariants: [
    {
      size: 'small',
      className: ['coz-loading-small'],
    },
    {
      size: 'normal',
      className: ['coz-loading-normal'],
    },
    {
      size: 'middle',
      className: ['coz-loading-middle'],
    },
    {
      size: 'large',
      className: ['coz-loading-large'],
    },
  ],
  defaultVariants: {
    size: 'middle',
  },
});

const loading = cva(['coz-loading'], {
  variants: {
    size: {
      large: [],
      middle: [],
      small: [],
      normal: [],
    },
    color: {
      default: [],
      blue: [],
      red: [],
      green: [],
    },
  },
  compoundVariants: [
    {
      size: 'large',
      className: ['text-32px'],
    },
    {
      size: 'middle',
      className: ['text-24px'],
    },
    {
      size: 'normal',
      className: ['text-18px'],
    },
    {
      size: 'small',
      className: ['text-14px'],
    },
    {
      color: 'default',
      className: ['coz-fg-secondary'],
    },
    {
      color: 'blue',
      className: ['coz-fg-hglt'],
    },
    {
      color: 'red',
      className: ['coz-fg-hglt-red'],
    },
    {
      color: 'green',
      className: ['coz-fg-hglt-green'],
    },
  ],
  defaultVariants: {
    size: 'middle',
  },
});

const label = cva(['coz-loading-label', 'flex', 'w-full', 'justify-center'], {
  variants: {
    labelSize: {
      large: [],
      normal: [],
      middle: [],
      small: [],
    },
  },
  compoundVariants: [
    {
      labelSize: 'large',
      className: ['text-xxl', 'coz-fg-secondary'],
    },
    {
      labelSize: 'middle',
      className: ['text-xl', 'coz-fg-secondary'],
    },
    {
      labelSize: 'normal',
      className: ['text-lg', 'coz-fg-secondary'],
    },
    {
      labelSize: 'small',
      className: ['text-base', 'coz-fg-secondary'],
    },
  ],
  defaultVariants: {
    labelSize: 'normal',
  },
});

export const loadingVariants = {
  wrapper,
  loading,
  label,
};
