import { forwardRef, type JSX } from 'react';

import { Dropdown as SemiDropdown } from '@douyinfe/semi-ui';

import { cn } from '@/utils';

import { type MenuProps } from './menu-types';
import { MenuTitle } from './menu-title';
import { MenuSubMenu } from './menu-sub-menu';
import { MenuItem } from './menu-item';
import { MenuDivider } from './menu-divider';

const MenuComponent = forwardRef<SemiDropdown, MenuProps>(
  (props, ref): JSX.Element => {
    const { className, visible } = { ...props };
    const cls = cn('coz-menu-wrapper', className);
    return (
      <SemiDropdown
        {...props}
        ref={ref}
        visible={visible}
        className={cls}
        showTick={false}
      />
    );
  },
);

MenuComponent.displayName = 'Menu';

export const Menu = Object.assign(MenuComponent, {
  SubMenu: MenuSubMenu,
  Menu: MenuSubMenu,
  Item: MenuItem,
  Title: MenuTitle,
  Divider: MenuDivider,
});
