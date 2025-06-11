import { type FC } from 'react';

import { Dropdown } from '@douyinfe/semi-ui';

import { type MenuTitleProps } from './menu-types';
const { Title } = Dropdown;

export const MenuTitle: FC<MenuTitleProps> = (props, context) => (
  <Title className="coz-menu-title" {...props} />
);
