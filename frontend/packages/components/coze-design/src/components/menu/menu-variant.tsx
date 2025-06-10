import { cva, type VariantProps } from 'class-variance-authority';

const menu = cva(['coz-menu'], {
  variants: {},
});

const item = cva([
  'coz-list-item',
  'flex',
  'w-full',
  'relative',
  'text-lg',
  'items-center',
  'font-normal',
  'coz-fg-primary',
  'active:no-underline',
]);

const detail = cva(['block', 'bg-white']);

export const menuVariant = {
  menu,
  item,
  detail,
};

export type DropdownVariantProps = VariantProps<typeof menu>;
