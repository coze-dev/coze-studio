import { type JSX, type FC } from 'react';

import { DropdownMenu as SemiDropdownMenu } from '@douyinfe/semi-ui';

import { cn } from '@/utils';

import { menuVariant } from './menu-variant';
import { type MenuSubItemProps } from './menu-types';
import { MenuContext } from './context/menu-context';

const defaultDropdownMenuProps: Partial<MenuSubItemProps> = {
  mode: 'selection',
  selectedKeys: [],
  onSelectionChange: () => {},
  multiple: false,
};

export const MenuSubMenu: FC<MenuSubItemProps> = (
  props,
  context,
): JSX.Element => {
  const {
    className,
    mode,
    selectedKeys,
    onSelectionChange,
    multiple,
    ...restProps
  } = {
    ...defaultDropdownMenuProps,
    ...props,
  };

  const cls = cn(
    menuVariant.menu(),
    {
      'coz-selection-mode': mode === 'selection',
    },
    className,
  );

  return (
    <MenuContext.Provider
      value={{
        // @ts-expect-error -- linter-disable-autofix
        mode,
        // @ts-expect-error -- linter-disable-autofix
        selectedKeys,
        // @ts-expect-error -- linter-disable-autofix
        multiple,
        onSelectionChange,
      }}
    >
      <SemiDropdownMenu className={cls} {...restProps} />
    </MenuContext.Provider>
  );
};
