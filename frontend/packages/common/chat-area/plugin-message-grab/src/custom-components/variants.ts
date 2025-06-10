import { cva, type VariantProps } from 'class-variance-authority';

const quoteNodeColorVariants = cva([], {
  variants: {
    showBackground: {
      true: ['text-[#FFFFFF/60]'],
      false: ['coz-fg-secondary'],
    },
  },
});

export const typeSafeQuoteNodeColorVariants: (
  props: Required<VariantProps<typeof quoteNodeColorVariants>>,
) => string = quoteNodeColorVariants;
