import { FC } from 'react';

import classNames from 'classnames';
import {
  DropdownItemProps,
  DropdownMenuProps,
  DropdownProps,
  DropdownTitleProps,
} from '@douyinfe/semi-ui/lib/es/dropdown';
import { Dropdown } from '@douyinfe/semi-ui';

import s from './index.module.less';

export const DropdownTitle: FC<DropdownTitleProps> = props => (
  <Dropdown.Title {...props} className={classNames(s.title, props.className)} />
);

export const Menu: FC<DropdownMenuProps> = props => (
  <Dropdown.Menu {...props} className={classNames(s.menu, props.className)} />
);

export const Item: FC<DropdownItemProps> = props => (
  <Dropdown.Item {...props} className={classNames(s.item, props.className)} />
);

export const UIDropdown: FC<DropdownProps> = ({ className, ...props }) => (
  <Dropdown {...props} className={classNames(className, s['ui-dropdown'])} />
);
