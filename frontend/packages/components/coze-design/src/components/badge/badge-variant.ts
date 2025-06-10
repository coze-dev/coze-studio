import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(['coz-badge'], {
  variants: {
    type: {
      mini: ['coz-badge-mini'],
      default: ['coz-badge-default'],
      alt: ['coz-badge-alt'],
    },
    cozLayout: {
      true: ['coz-badge-layout', 'ml-5px'],
    },
  },
  compoundVariants: [
    {
      type: 'mini',
      cozLayout: true,
      className: 'ml-9px',
    },
  ],
  defaultVariants: {
    type: 'default',
    cozLayout: false,
  },
});

export type BadgeProps = VariantProps<typeof badgeVariants>;

export { badgeVariants };
