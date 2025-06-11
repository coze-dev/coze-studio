import { cva } from 'class-variance-authority';

const titleVariants = cva(['coz-typography'], {
  variants: {
    type: {
      title: ['coz-title', 'font-medium'],
    },
    size: {
      inherit: '',
      '28px': 'coz-title-28',
      '20px': 'coz-title-20',
      '16px': 'coz-title-16',
      '14px': 'coz-title-14',
      '12px': 'coz-title-12',
    },
  },
  compoundVariants: [
    {
      type: 'title',
      size: '28px',
      className: ['text-28px', 'leading-36px'],
    },
    {
      type: 'title',
      size: '20px',
      className: ['text-20px', 'leading-28px'],
    },
    {
      type: 'title',
      size: '16px',
      className: ['text-xxl', 'leading-22px'],
    },
    {
      type: 'title',
      size: '14px',
      className: ['text-lg', 'leading-20px'],
    },
    {
      type: 'title',
      size: '12px',
      className: ['text-base', 'leading-16px'],
    },
  ],
  defaultVariants: {
    size: 'inherit',
  },
});

const textVariants = cva(['coz-typography'], {
  variants: {
    type: {
      text: ['coz-text', 'font-normal'],
    },
    size: {
      inherit: '',
      '16px': 'coz-text-16',
      '14px': 'coz-text-14',
      '12px': 'coz-text-12',
      '10px': 'coz-text-10',
    },
  },
  compoundVariants: [
    {
      type: 'text',
      size: '16px',
      className: ['text-xxl', 'leading-28px'],
    },
    {
      type: 'text',
      size: '14px',
      className: ['text-lg', 'leading-20px'],
    },
    {
      type: 'text',
      size: '12px',
      className: ['text-base', 'leading-16px'],
    },
    {
      type: 'text',
      size: '10px',
      className: ['text-mini', 'leading-14px'],
    },
  ],
  defaultVariants: {
    size: 'inherit',
  },
});

const paragraphVariants = cva(['coz-typography'], {
  variants: {
    type: {
      paragraph: ['coz-paragraph'],
    },
    size: {
      inherit: '',
      '16px': 'coz-paragraph-16',
      '14px': 'coz-paragraph-14',
      '12px': 'coz-paragraph-12',
    },
  },
  compoundVariants: [
    {
      type: 'paragraph',
      size: '16px',
      className: ['text-xxl', 'leading-28px'],
    },
    {
      type: 'paragraph',
      size: '14px',
      className: ['text-lg', 'leading-20px'],
    },
    {
      type: 'paragraph',
      size: '12px',
      className: ['text-base', 'leading-16px'],
    },
  ],
  defaultVariants: {
    size: 'inherit',
  },
});

const numeralVariants = cva(['coz-typography'], {
  variants: {
    type: {
      numeral: ['coz-numeral'],
    },
  },
  compoundVariants: [],
  defaultVariants: {
    type: 'numeral',
  },
});

export { titleVariants, textVariants, paragraphVariants, numeralVariants };
