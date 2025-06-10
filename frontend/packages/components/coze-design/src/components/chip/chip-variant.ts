import { cva } from 'class-variance-authority';

export const chipVariants = cva(
  [
    'coz-chip',
    'font-medium',
    'text-base',
    'w-fit',
    'flex',
    'items-center',
    'leading-none',
  ],
  {
    variants: {
      size: {
        small: 'px-8px py-4px  h-24px  rounded-small ',
        mini: 'px-6px py-3px h-20px rounded-mini',
      },
      color: {
        brand: 'coz-mg-hglt coz-fg-hglt',
        primary: 'coz-mg-primary coz-fg-primary',
        green: 'coz-mg-hglt-green coz-fg-hglt-green ',
        yellow: 'coz-mg-hglt-yellow coz-fg-hglt-yellow ',
        red: 'coz-mg-hglt-red coz-fg-hglt-red ',
        cyan: 'coz-mg-color-cyan coz-fg-color-cyan ',
        blue: 'coz-mg-color-blue coz-fg-color-blue ',
        purple: 'coz-mg-color-purple coz-fg-color-purple ',
        magenta: 'coz-mg-color-magenta coz-fg-color-magenta ',
      },

      chipStyle: {
        readonly: 'cursor-default',
        remove: 'cursor-default',
        select: 'cursor-pointer',
      },
      disabled: {
        true: 'cursor-not-allowed',
        false: '',
      },
      loading: {
        true: 'cursor-not-allowed',
        false: '',
      },
    },
    compoundVariants: [
      {
        size: 'small',
        chipStyle: ['remove', 'select'],
        className: 'pr-6px',
      },
      {
        size: 'mini',
        chipStyle: ['remove', 'select'],
        className: 'pr-4px',
      },
      {
        chipStyle: 'select',
        color: 'brand',
        className: 'hover:coz-mg-hglt-hovered active:coz-mg-hglt-pressed',
      },
      {
        chipStyle: 'select',
        color: 'primary',
        className: 'hover:coz-mg-primary-hovered active:coz-mg-primary-pressed',
      },
      {
        chipStyle: 'select',
        color: 'green',
        className:
          'hover:coz-mg-hglt-green-hovered active:coz-mg-hglt-green-pressed',
      },
      {
        chipStyle: 'select',
        color: 'yellow',
        className:
          'hover:coz-mg-hglt-yellow-hovered active:coz-mg-hglt-yellow-pressed',
      },
      {
        chipStyle: 'select',
        color: 'red',
        className:
          'hover:coz-mg-hglt-red-hovered active:coz-mg-hglt-red-pressed',
      },
      {
        chipStyle: 'select',
        color: 'cyan',
        className:
          'hover:coz-mg-color-cyan-hovered active:coz-mg-color-cyan-pressed',
      },
      {
        chipStyle: 'select',
        color: 'blue',
        className:
          'hover:coz-mg-color-blue-hovered active:coz-mg-color-blue-pressed',
      },
      {
        chipStyle: 'select',
        color: 'purple',
        className:
          'hover:coz-mg-color-purple-hovered active:coz-mg-color-purple-pressed',
      },
      {
        chipStyle: 'select',
        color: 'magenta',
        className:
          'hover:coz-mg-color-magenta-hovered active:coz-mg-color-magenta-pressed',
      },
      {
        disabled: true,
        color: 'brand',
        className: 'coz-fg-hglt-dim hover:coz-mg-hglt active:coz-mg-hglt',
      },
      {
        disabled: true,
        color: 'primary',
        className: 'coz-fg-dim hover:coz-mg-primary active:coz-mg-primary',
      },
      {
        disabled: true,
        color: 'green',
        className:
          'coz-fg-hglt-green-dim hover:coz-mg-hglt-green active:coz-mg-hglt-green',
      },
      {
        disabled: true,
        color: 'yellow',
        className:
          'coz-fg-hglt-yellow-dim hover:coz-mg-hglt-yellow active:coz-mg-hglt-yellow',
      },
      {
        disabled: true,
        color: 'red',
        className:
          'coz-fg-hglt-red-dim hover:coz-mg-hglt-red active:coz-mg-hglt-red',
      },
      {
        disabled: true,
        color: 'cyan',
        className:
          'coz-fg-color-cyan-dim hover:coz-mg-color-cyan active:coz-mg-color-cyan',
      },
      {
        disabled: true,
        color: 'blue',
        className:
          'coz-fg-color-blue-dim hover:coz-mg-color-blue active:coz-mg-color-blue',
      },
      {
        disabled: true,
        color: 'purple',
        className:
          'coz-fg-color-purple-dim hover:coz-mg-color-purple active:coz-mg-color-purple',
      },
      {
        disabled: true,
        color: 'magenta',
        className:
          'coz-fg-color-magenta-dim hover:coz-mg-color-magenta active:coz-mg-color-magenta',
      },
      {
        loading: true,
        color: 'brand',
        className: 'coz-fg-hglt-dim hover:coz-mg-hglt active:coz-mg-hglt',
      },
      {
        loading: true,
        color: 'primary',
        className: 'coz-fg-dim hover:coz-mg-primary active:coz-mg-primary',
      },
      {
        loading: true,
        color: 'green',
        className:
          'coz-fg-hglt-green-dim hover:coz-mg-hglt-green active:coz-mg-hglt-green',
      },
      {
        loading: true,
        color: 'yellow',
        className:
          'coz-fg-hglt-yellow-dim hover:coz-mg-hglt-yellow active:coz-mg-hglt-yellow',
      },
      {
        loading: true,
        color: 'red',
        className:
          'coz-fg-hglt-red-dim hover:coz-mg-hglt-red active:coz-mg-hglt-red',
      },
      {
        loading: true,
        color: 'cyan',
        className:
          'coz-fg-color-cyan-dim hover:coz-mg-color-cyan active:coz-mg-color-cyan',
      },
      {
        loading: true,
        color: 'blue',
        className:
          'coz-fg-color-blue-dim hover:coz-mg-color-blue active:coz-mg-color-blue',
      },
      {
        loading: true,
        color: 'purple',
        className:
          'coz-fg-color-purple-dim hover:coz-mg-color-purple active:coz-mg-color-purple',
      },
      {
        loading: true,
        color: 'magenta',
        className:
          'coz-fg-color-magenta-dim hover:coz-mg-color-magenta active:coz-mg-color-magenta',
      },
    ],
    defaultVariants: {
      size: 'small',
      color: 'brand',
      disabled: false,
      loading: false,
    },
  },
);
