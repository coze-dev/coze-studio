import { type FC } from 'react';

import { Dropdown } from '@douyinfe/semi-ui';

import { type MenuTitleProps } from './menu-types';
const { Divider } = Dropdown;

import './index.css';

export const MenuDivider: FC<MenuTitleProps> = (props, context) => (
  <Divider {...props} className="coz-menu-divider" />
);
