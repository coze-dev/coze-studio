import { cva, type VariantProps } from 'class-variance-authority';

const switchVariants = cva(
  ['coz-switch', 'border-transparent', 'active:border-transparent'],
  {
    variants: {
      size: {
        default: ['w-14'],
        small: [],
        mini: [],
      },
      checked: {
        true: [],
        false: [],
      },
      disabled: {
        true: ['cursor-not-allowed', 'opacity-50'],
        false: [],
      },
      loading: {
        true: ['cursor-not-allowed', 'opacity-50'],
        false: [],
      },
    },
    compoundVariants: [
      // 正常态
      {
        checked: true,
        disabled: false,
        loading: false,
        className: [
          'coz-mg-hglt-plus',
          'hover:coz-mg-hglt-plus-hovered',
          'active:coz-mg-hglt-plus-pressed',
        ],
      },
      {
        checked: false,
        disabled: false,
        loading: false,
        className: [
          'coz-mg-hglt',
          'hover:coz-mg-hglt-hovered',
          'active:coz-mg-hglt-pressed',
        ],
      },
      // disabled 态
      {
        checked: true,
        disabled: true,
        loading: false,
        className: [
          'coz-mg-hglt-plus-dim',
          'hover:coz-mg-hglt-plus-dim',
          'active:coz-mg-hglt-plus-dim',
        ],
      },
      {
        checked: false,
        disabled: true,
        loading: false,
        className: [
          'coz-mg-primary',
          'hover:coz-mg-primary',
          'active:coz-mg-primary',
        ],
      },
      // loading 态
      {
        checked: true,
        disabled: false,
        loading: true,
        className: [
          'coz-mg-hglt-plus-dim',
          'hover:coz-mg-hglt-plus-dim',
          'active:coz-mg-hglt-plus-dim',
        ],
      },
      {
        checked: false,
        disabled: false,
        loading: true,
        className: [
          'coz-mg-primary',
          'hover:coz-mg-primary',
          'active:coz-mg-primary',
        ],
      },
      // loading + disabled
      {
        checked: false,
        disabled: true,
        loading: true,
        className: [
          'coz-mg-primary',
          'hover:coz-mg-primary',
          'active:coz-mg-primary',
        ],
      },
    ],
    defaultVariants: {
      size: 'default',
      checked: false,
      loading: false,
      disabled: false,
    },
  },
);

export type SwitchVariantProps = VariantProps<typeof switchVariants>;

export { switchVariants };
