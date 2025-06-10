import { cva, type VariantProps } from 'class-variance-authority';

export const messageBoxContainerVariants = cva(['flex', 'flex-row', 'my-0'], {
  variants: {
    isMobileLayout: {
      true: ['mx-[12px]'],
      false: ['mx-[24px]'],
    },
  },
});

export const botNicknameVariants = cva(
  [
    'text-base',
    'font-normal',
    'leading-[16px]',
    'break-words',
    'flex-shrink-0',
    '!max-w-[400px]',
  ],
  {
    variants: {
      showBackground: {
        true: ['coz-fg-images-user-name'],
        false: ['coz-fg-secondary'],
      },
    },
  },
);
export type BotNicknameVariantsProps = Required<
  VariantProps<typeof botNicknameVariants>
>;
export const typeSafeBotNicknameVariants: (
  props: BotNicknameVariantsProps,
) => string = botNicknameVariants;
