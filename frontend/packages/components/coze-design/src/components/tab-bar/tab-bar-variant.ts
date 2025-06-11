import { cva, type VariantProps } from 'class-variance-authority';

const tabBarVariants = cva(['coz-tab-bar'], {
  variants: {
    align: {
      left: 'coz-tab-bar-left',
      center: 'coz-tab-bar-center',
      right: 'coz-tab-bar-right',
    },
    mode: {
      tab: '',
      select: 'coz-tab-bar-select',
    },
  },
  compoundVariants: [],
  defaultVariants: {
    align: 'left',
    mode: 'tab',
  },
});

export type TabBarProps = VariantProps<typeof tabBarVariants>;

export { tabBarVariants };
