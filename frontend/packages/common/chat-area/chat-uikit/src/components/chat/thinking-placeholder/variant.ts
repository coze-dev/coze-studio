import { cva, type VariantProps } from 'class-variance-authority';

const thinkingPlaceholderVariants = cva(
  [
    'h-[44px]',
    'w-fit',
    'flex',
    'justify-center',
    'items-center',
    'py-12px',
    'px-16px',
    'rounded-normal',
  ],
  {
    variants: {
      backgroundColor: {
        whiteness: ['bg-[var(--coz-mg-card)]'],
        grey: ['bg-[var(--coz-mg-primary)]'],
        primary: ['bg-[var(coz-mg-hglt-plus)]'],
        withBackground: ['coz-bg-image-bots', 'coz-stroke-image-bots'],
        none: ['coz-stroke-primary'],
      },
    },
  },
);

export type ThinkingPlaceholderVariantProps = Required<
  VariantProps<typeof thinkingPlaceholderVariants>
>;
export const typeSafeThinkingPlaceholderVariants: (
  props: ThinkingPlaceholderVariantProps,
) => string = thinkingPlaceholderVariants;
