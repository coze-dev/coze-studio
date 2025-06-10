import { cva, type VariantProps } from 'class-variance-authority';

const base = cva(
  ['coz-avatar', 'inline-flex', 'items-center', 'justify-center'],
  {
    variants: {
      hoverMask: {
        true: [],
        false: [],
      },
      src: {
        true: [],
        false: [],
      },
      type: {
        bot: ['coz-avatar-bot'],
        platform: ['coz-avatar-platform'],
        person: ['coz-avatar-person'],
        team: ['coz-avatar-team'],
      },
      color: {
        blue: ['coz-avatar-blue'],
        cyan: ['coz-avatar-cyan'],
        green: ['coz-avatar-green'],
        yellow: ['coz-avatar-yellow'],
        purple: ['coz-avatar-purple'],
        orange: ['coz-avatar-orange'],
        grey: ['coz-avatar-gray'],
        red: ['coz-avatar-red'],
        pink: ['coz-avatar-pink'],
        indigo: ['coz-avatar-brand'],
      },
      size: {
        ultra: ['coz-avatar-ultra'],
        xxl: ['coz-avatar-xxl'],
        xl: ['coz-avatar-xl'],
        lg: ['coz-avatar-lg'],
        plus: ['coz-avatar-plus'],
        default: ['coz-avatar-default'],
        small: ['coz-avatar-small'],
        mini: ['coz-avatar-mini'],
        micro: ['coz-avatar-micro'],
      },
    },
    compoundVariants: [
      {
        size: 'ultra',
        type: ['bot', 'platform'],
        className: ['w-160px', 'h-160px', 'rounded-ultra', 'text-64px'],
      },
      {
        size: 'ultra',
        type: ['person', 'team'],
        className: ['w-160px', 'h-160px', 'text-64px'],
      },
      {
        size: 'xxl',
        type: ['bot', 'platform'],
        className: ['w-80px', 'h-80px', 'rounded-xxl', 'text-36px'],
      },
      {
        size: 'xxl',
        type: ['person', 'team'],
        className: ['w-80px', 'h-80px', 'text-36px'],
      },
      {
        size: 'xl',
        type: ['bot', 'platform'],
        className: ['w-64px', 'h-64px', 'rounded-xl', 'text-24px'],
      },
      {
        size: 'xl',
        type: ['person', 'team'],
        className: ['w-64px', 'h-64px', 'text-24px'],
      },
      {
        size: 'lg',
        type: ['bot', 'platform'],
        className: ['w-48px', 'h-48px', 'rounded-md', 'text-18px'],
      },
      {
        size: 'lg',
        type: ['person', 'team'],
        className: ['w-48px', 'h-48px', 'text-18px'],
      },
      {
        size: 'plus',
        type: ['bot', 'platform'],
        className: ['w-[36px]', 'h-[36px]', 'rounded-m', 'text-xxl'],
      },
      {
        size: 'plus',
        type: ['person', 'team'],
        className: ['w-[36px]', 'h-[36px]', 'text-xxl'],
      },
      {
        size: 'default',
        type: ['bot', 'platform'],
        className: ['w-32px', 'h-32px', 'rounded-normal', 'text-xl'],
      },
      {
        size: 'default',
        type: ['person', 'team'],
        className: ['w-32px', 'h-32px', 'text-xl'],
      },
      {
        size: 'small',
        type: ['bot', 'platform'],
        className: ['w-24px', 'h-24px', 'rounded-small', 'text-lg'],
      },
      {
        size: 'small',
        type: ['person', 'team'],
        className: ['w-24px', 'h-24px', 'text-lg'],
      },
      {
        size: 'mini',
        type: ['bot', 'platform'],
        className: ['w-18px', 'h-18px', 'rounded-mini', 'text-base'],
      },
      {
        size: 'mini',
        type: ['person', 'team'],
        className: ['w-18px', 'h-18px', 'text-base'],
      },
      {
        size: 'micro',
        type: ['bot', 'platform'],
        className: ['w-16px', 'h-16px', 'rounded-mini', 'text-base'],
      },
      {
        size: 'micro',
        type: ['person', 'team'],
        className: ['w-16px', 'h-16px', 'text-base'],
      },
      {
        hoverMask: true,
        className: ['coz-avatar-editable'],
      },
      {
        hoverMask: false,
        className: [],
      },
      {
        color: 'blue',
        src: false,
        className: [
          'coz-mg-hglt-plus',
          'coz-stroke-primary',
          'border',
          'border-solid',
        ],
      },
      {
        color: 'red',
        src: false,
        className: [
          'coz-mg-hglt-plus-red',
          'coz-stroke-primary',
          'border',
          'border-solid',
        ],
      },
      {
        color: 'grey',
        src: false,
        className: [
          'coz-mg-primary',
          'coz-stroke-primary',
          'border',
          'border-solid',
          'border-[0.5px]',
          'coz-fg-secondary',
        ],
      },
      {
        color: 'green',
        src: false,
        className: [
          'coz-mg-hglt-plus-green',
          'coz-stroke-primary',
          'border',
          'border-solid',
        ],
      },
      {
        color: 'orange',
        src: false,
        className: [
          'coz-mg-color-plus-orange',
          'coz-stroke-primary',
          'border',
          'border-solid',
        ],
      },
      {
        color: 'purple',
        src: false,
        className: [
          'coz-mg-hglt-plus-purple',
          'coz-stroke-primary',
          'border',
          'border-solid',
        ],
      },
      {
        color: 'cyan',
        src: false,
        className: [
          'coz-mg-hglt-plus-cyan',
          'coz-stroke-primary',
          'border',
          'border-solid',
        ],
      },
      {
        color: 'yellow',
        src: false,
        className: [
          'coz-mg-color-plus-yellow',
          'coz-stroke-primary',
          'border',
          'border-solid',
        ],
      },
      {
        color: 'indigo',
        src: false,
        className: [
          'coz-mg-color-plus-brand',
          'coz-stroke-primary',
          'border',
          'border-solid',
        ],
      },
    ],
    defaultVariants: {
      type: 'person',
      src: false,
      color: 'blue',
      hoverMask: false,
    },
  },
);

export const avatarVariant = {
  base,
};

export type AvatarVariantProps = VariantProps<typeof base>;
