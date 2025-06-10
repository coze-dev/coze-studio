import type React from 'react';
import type { HTMLAttributes } from 'react';

import {
  type DropdownItemProps as SemiDropdownItemProps,
  type DropdownMenuProps as SemiDropdownMenuProps,
  type DropdownProps as SemiDropdownProps,
  type DropDownMenuItem as SemiDropDownMenuItem,
} from '@douyinfe/semi-ui/lib/es/dropdown';

import type { IComponentBaseProps } from '@/typings';

export interface MenuProps extends IComponentBaseProps, SemiDropdownProps {}

export interface MenuSubItemProps
  extends IComponentBaseProps,
    SemiDropdownMenuProps {
  mode?: 'menu' | 'selection';
  multiple?: boolean;
  selectedKeys?: string[];
  onSelectionChange?: (value: string, values: string[]) => void;
}

export interface MenuItemProps extends Omit<SemiDropdownItemProps, 'onClick'> {
  suffix?: React.ReactNode | string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: (value: string, event: React.MouseEvent<HTMLLIElement>) => void;
  itemKey?: string;
  value?: string;
  isMenu?: boolean;
}

export interface MenuTitleProps
  extends IComponentBaseProps,
    HTMLAttributes<HTMLDivElement> {}

export interface MenuDividerProps
  extends IComponentBaseProps,
    HTMLAttributes<HTMLDivElement> {}

export type MenuItem = SemiDropDownMenuItem;
