import { cva, type VariantProps } from 'class-variance-authority';

const audioStaticToastVariants = cva(['px-24px', 'py-10px', 'rounded-[99px]'], {
  variants: {
    theme: {
      primary: ['bg-[#F2F3F7]'],
      danger: ['bg-[#FFEFF1]'],
      background: ['coz-bg-image-bots'],
    },
    color: {
      primary: ['coz-fg-primary'],
      danger: ['coz-fg-hglt-red'],
    },
  },
});

export type AudioStaticToastVariantsProps = Required<
  VariantProps<typeof audioStaticToastVariants>
>;
export const typeSafeAudioStaticToastVariants: (
  props: AudioStaticToastVariantsProps,
) => string = audioStaticToastVariants;
