import { cva, type VariantProps } from 'class-variance-authority';
const tagVariants = cva(['coz-tag'], {
  variants: {
    size: {
      mini: ['coz-tag-mini', 'h-mini', 'rounded-mini', 'text-[10px]'],
      small: ['coz-tag-small', 'rounded-little'],
    },
    color: {
      brand: ['coz-tag-brand'],
      primary: ['coz-tag-primary'],
      green: ['coz-tag-green'],
      yellow: ['coz-tag-yellow'],
      red: ['coz-tag-red'],
      cyan: ['coz-tag-cyan'],
      blue: ['coz-tag-blue'],
      purple: ['coz-tag-purple'],
      magenta: ['coz-tag-magenta'],
      grey: ['coz-tag-grey'],
    },
    cursorPointer: {
      true: ['cursor-pointer'],
      false: [],
    },
    prefixIcon: {
      info: [],
    },
    suffixIcon: {
      error: [],
    },
    onlyPrefixIcon: {
      true: [],
      false: [],
    },
    interactive: {
      true: ['tag-interactive'],
      false: [],
    },
    loading: {
      true: ['coz-tag-loading'],
      false: [],
    },
    disabled: {
      true: ['coz-tag-disabled'],
      false: [],
    },
  },
  defaultVariants: {
    size: 'small',
    prefixIcon: 'info',
    suffixIcon: undefined,
  },
  compoundVariants: [
    {
      onlyPrefixIcon: true,
      size: 'small',
      className: ['!pt-0', '!pb-0', '!pl-[5px]', '!pr-[5px]'],
    },
    {
      onlyPrefixIcon: true,
      size: 'mini',
      className: ['!pt-0', '!pb-0', '!pl-[2px]', '!pr-[2px]'],
    },
  ],
});

export type TagVariantProps = VariantProps<typeof tagVariants>;

export { tagVariants };
