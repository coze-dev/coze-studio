import { cva, type VariantProps } from 'class-variance-authority';

export const toastVariant = cva(['coz-toast'], {
  variants: {
    type: {
      default: [],
      info: [],
      error: [],
      warning: [],
      success: [],
    },
  },
  compoundVariants: [
    {
      type: 'default',
      className: ['coz-toast-info'],
    },
    {
      type: 'info',
      className: ['coz-toast-info'],
    },
    {
      type: 'error',
      className: ['coz-toast-error'],
    },
    {
      type: 'warning',
      className: ['coz-toast-warning'],
    },
    {
      type: 'success',
      className: ['coz-toast-success'],
    },
  ],
  defaultVariants: {
    type: 'default',
  },
});

export type ToastVariantProps = VariantProps<typeof toastVariant>;
