import { type IComponentBaseProps } from '@/typings';
import {
  type TabsProps as SemiTabsProps,
  type TabPaneProps as SemiTabPaneProps,
  type TabBarProps as SemiTabBarProps,
} from '@/components/semi/types';

export type TabType = 'button' | 'text';
export type TabOriginType = 'button' | 'line';

export interface TabsTopProps
  extends IComponentBaseProps,
    Omit<SemiTabsProps, 'type'> {
  mode?: 'tab' | 'select';
  type?: TabType;
  align?: 'left' | 'center' | 'right';
}

export interface TabsBarProps
  extends IComponentBaseProps,
    Omit<SemiTabBarProps, 'closable'> {}

export interface TabsBarPanelProps
  extends IComponentBaseProps,
    Omit<SemiTabPaneProps, 'closable'> {}
