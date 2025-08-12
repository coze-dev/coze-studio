/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
