import { cva, type VariantProps } from 'class-variance-authority';

export const botInfoNameVariants = cva(
  ['leading-[28px]', 'font-medium', 'text-20px'],
  {
    variants: {
      showBackground: {
        true: ['coz-fg-images-user-name'],
        false: ['coz-fg-plus'],
      },
    },
  },
);

export type BotInfoVariantProps = VariantProps<typeof botInfoNameVariants>;

export const typeSafeBotInfoNameVariants: (
  props: BotInfoVariantProps,
) => string = botInfoNameVariants;
