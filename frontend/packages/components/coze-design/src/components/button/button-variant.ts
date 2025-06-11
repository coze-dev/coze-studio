import { cva, type VariantProps } from 'class-variance-authority';

import { type ComponentBgVariants } from '@/typings';

const buttonVariants = cva(
  [
    'coz-button',
    'focus:outline-none',
    'transition',
    'duration-150',
    'ease-in-out',
  ],
  {
    variants: {
      size: {
        large: ['coz-btn-large'],
        default: ['coz-btn-default'],
        small: ['coz-btn-small'],
        mini: ['coz-btn-mini'],
        icon: ['coz-btn-icon'],
      },
      color: {
        aiplus: [],
        aihglt: [],
        aiprimary: [],
        brand: [],
        hgltplus: [],
        highlight: [],
        primary: [],
        secondary: [],
        red: [],
        yellow: [],
        green: [],
        redhglt: [],
      },
      loading: {
        true: ['cursor-not-allowed'],
        false: [],
      },
      disabled: {
        true: ['cursor-not-allowed'],
        false: [],
      },
    },
    compoundVariants: [
      {
        color: 'brand',
        disabled: false,
        className: [
          'coz-btn-brand',
          'coz-mg-hglt-plus',
          'coz-fg-hglt-plus',
          'hover:coz-mg-hglt-plus-hovered',
          'active:coz-mg-hglt-plus-pressed',
        ],
      },
      {
        color: 'brand',
        disabled: true,
        className: [
          'coz-btn-brand',
          'hover:coz-fg-hglt-plus-dim',
          'active:coz-fg-hglt-plus-dim',
          'disabled:coz-fg-hglt-plus-dim',
          'disabled:coz-mg-hglt-plus-dim',
        ],
      },
      {
        color: 'hgltplus',
        disabled: false,
        className: [
          'coz-btn-brand',
          'coz-mg-hglt-plus',
          'coz-fg-hglt-plus',
          'hover:coz-mg-hglt-plus-hovered',
          'active:coz-mg-hglt-plus-pressed',
        ],
      },
      {
        color: 'hgltplus',
        disabled: true,
        className: [
          'coz-btn-brand',
          'hover:coz-fg-hglt-plus-dim',
          'active:coz-fg-hglt-plus-dim',
          'disabled:coz-fg-hglt-plus-dim',
          'disabled:coz-mg-hglt-plus-dim',
        ],
      },
      {
        color: 'highlight',
        disabled: false,
        className: [
          'coz-btn-highlight',
          'coz-fg-hglt',
          'coz-mg-hglt',
          'hover:coz-mg-hglt-hovered',
          'active:coz-mg-hglt-pressed',
        ],
      },
      {
        color: 'highlight',
        disabled: true,
        className: [
          'coz-btn-highlight',
          'coz-mg-hglt',
          'hover:coz-fg-hglt-dim',
          'active:coz-mg-hglt',
          'disabled:coz-fg-hglt-dim',
          'disabled:coz-mg-hglt',
        ],
      },
      {
        color: 'primary',
        disabled: false,
        className: [
          'coz-btn-primary',
          'coz-fg-primary',
          'coz-mg-primary',
          'hover:coz-mg-primary-hovered',
          'active:coz-mg-primary-pressed',
        ],
      },
      {
        color: 'primary',
        disabled: true,
        className: [
          'coz-btn-primary',
          'coz-fg-primary',
          'coz-mg-primary',
          'hover:coz-mg-primary-hovered',
          'active:coz-mg-primary-pressed',
          'disabled:coz-fg-dim',
          'disabled:coz-mg-primary',
        ],
      },
      {
        color: 'secondary',
        disabled: false,
        className: [
          'coz-btn-secondary',
          'coz-fg-secondary',
          'bg-transparent',
          'hover:coz-mg-secondary-hovered',
          'active:coz-mg-secondary-pressed',
        ],
      },
      {
        color: 'secondary',
        disabled: true,
        className: [
          'coz-btn-secondary',
          'coz-fg-secondary',
          'hover:bg-transparent',
          'active:bg-transparent',
          'disabled:coz-fg-dim',
          'disabled:bg-transparent',
        ],
      },

      {
        color: 'yellow',
        disabled: false,
        className: [
          'coz-btn-yellow',
          'coz-mg-hglt-plus-yellow',
          'coz-fg-white',
          'hover:coz-mg-hglt-plus-yellow-hovered',
          'active:coz-mg-hglt-plus-yellow-pressed',
        ],
      },
      {
        color: 'yellow',
        disabled: true,
        className: [
          'coz-btn-yellow',
          'coz-fg-white',
          'coz-mg-hglt-plus-yellow',
          'hover:coz-mg-hglt-plus-yellow-hovered',
          'active:coz-mg-hglt-plus-yellow-pressed',
          'disabled:coz-fg-white-dim',
          'disabled:coz-mg-hglt-plus-yellow-dim',
        ],
      },
      {
        color: 'red',
        disabled: false,
        className: [
          'coz-btn-red',
          'coz-mg-hglt-plus-red',
          'coz-fg-white',
          'hover:coz-mg-hglt-plus-red-hovered',
          'active:coz-mg-hglt-plus-red-pressed',
        ],
      },
      {
        color: 'red',
        disabled: true,
        className: [
          'coz-btn-red',
          'coz-fg-white',
          'coz-mg-hglt-plus-red',
          'hover:coz-mg-hglt-plus-red-hovered',
          'active:coz-mg-hglt-plus-red-pressed',
          'disabled:coz-fg-white-dim',
          'disabled:coz-mg-hglt-plus-red-dim',
        ],
      },
      {
        color: 'redhglt',
        disabled: false,
        className: [
          'coz-btn-redhglt',
          'coz-mg-hglt-red',
          'coz-fg-hglt-red',
          'hover:coz-mg-hglt-red-hovered',
          'active:coz-mg-hglt-red-pressed',
        ],
      },
      {
        color: 'redhglt',
        disabled: true,
        className: [
          'coz-btn-redhglt',
          'coz-fg-hglt-red-dim',
          'coz-mg-hglt-red',
          'hover:coz-fg-hglt-red-dim',
          'active:coz-mg-hglt-red',
          'disabled:coz-fg-hglt-red-dim',
          'disabled:coz-mg-hglt-red',
        ],
      },
      {
        color: 'green',
        disabled: false,
        className: [
          'coz-btn-green',
          'coz-mg-hglt-plus-green',
          'coz-fg-white',
          'hover:coz-mg-hglt-plus-green-hovered',
          'active:coz-mg-hglt-plus-green-pressed',
        ],
      },
      {
        color: 'green',
        disabled: true,
        className: [
          'coz-btn-green',
          'coz-fg-white',
          'coz-mg-hglt-plus-green',
          'hover:coz-mg-hglt-plus-green-hovered',
          'active:coz-mg-hglt-plus-green-pressed',
          'disabled:coz-fg-white-dim',
          'disabled:coz-mg-hglt-plus-green-dim',
        ],
      },
      {
        color: 'aiplus',
        disabled: false,
        className: ['coz-btn-ai-plus', 'coz-fg-hglt-plus'],
      },
      {
        color: 'aiplus',
        disabled: true,
        className: ['coz-btn-ai-plus', 'coz-fg-hglt-plus-dim'],
      },
      {
        color: 'aihglt',
        disabled: false,
        className: ['coz-btn-ai-hglt', 'coz-fg-hglt'],
      },
      {
        color: 'aihglt',
        disabled: true,
        className: ['coz-btn-ai-hglt', 'coz-fg-dim'],
      },
      {
        color: 'aiprimary',
        disabled: false,
        className: ['coz-btn-ai-primary', 'coz-fg-hglt'],
      },
      {
        color: 'aiprimary',
        disabled: true,
        className: ['coz-btn-ai-primary', 'coz-fg-dim'],
      },
    ],
    defaultVariants: {
      color: 'brand',
      size: 'default',
    },
  },
);

const buttonIconVariants = cva(['coz-ai-button-icon'], {
  variants: {
    color: {
      aiplus: [],
      aihglt: [],
      aiprimary: [],
      brand: [],
      hgltplus: [],
      highlight: [],
      primary: [],
      secondary: [],
      red: [],
      yellow: [],
      green: [],
      redhglt: [],
    },
    disabled: {
      true: ['cursor-not-allowed'],
      false: [],
    },
    hideIcon: {
      true: [],
      false: [],
    },
    onlyIcon: {
      true: [],
      false: [],
    },
  },
  compoundVariants: [
    {
      color: 'aiplus',
      disabled: false,
      className: ['coz-fg-hglt-plus'],
    },
    {
      color: 'aiplus',
      disabled: true,
      className: ['coz-ai-button-icon-disabled', 'coz-fg-hglt-plus-dim'],
    },
    {
      color: 'aihglt',
      disabled: false,
      className: ['coz-fg-hglt'],
    },
    {
      color: 'aihglt',
      disabled: true,
      className: ['coz-ai-button-icon-disabled', 'disabled:coz-fg-hglt-dim'],
    },
    {
      color: 'aiprimary',
      disabled: false,
      className: ['coz-fg-hglt'],
    },
    {
      color: 'aiprimary',
      disabled: true,
      className: ['coz-ai-button-icon-disabled', 'disabled:coz-fg-hglt-dim'],
    },
    {
      hideIcon: true,
      onlyIcon: false,
      className: ['hidden'],
    },
    {
      hideIcon: false,
      onlyIcon: true,
      className: [''],
    },
    {
      hideIcon: true,
      onlyIcon: true,
      className: [''],
    },
    {
      hideIcon: false,
      onlyIcon: false,
      className: [''],
    },
  ],
});

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
export type ButtonIconVariantsProps = VariantProps<typeof buttonIconVariants>;

// 与defaultVariants一一对应
export const btnVariant: Record<ComponentBgVariants, ButtonVariantProps> = {
  primary: {
    color: 'brand',
    size: 'default',
  },
  secondary: {
    color: 'secondary',
    size: 'default',
  },
  tertiary: {
    color: 'yellow',
    size: 'default',
  },
};

export { buttonVariants, buttonIconVariants };
