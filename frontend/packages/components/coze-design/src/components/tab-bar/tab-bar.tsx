/* eslint-disable @typescript-eslint/naming-convention */

import { forwardRef } from 'react';

import { Tabs as SemiTabs } from '@douyinfe/semi-ui';

import { cn, mergeProps } from '@/utils';

import { tabBarVariants } from './tab-bar-variant';
import {
  type TabsTopProps,
  type TabsBarProps,
  type TabType,
  type TabOriginType,
} from './tab-bar-types';
import { TabBarPanel } from './tab-bar-panel';

import './index.css';

const defaultProps: Partial<TabsTopProps> = {
  tabPaneMotion: false,
  type: 'button',
  align: 'left',
  mode: 'tab',
};

const tabTypeMap: Record<TabType, TabOriginType> = {
  button: 'button',
  text: 'line',
};

export const Tabs = forwardRef<SemiTabs, TabsTopProps>((props, ref) => {
  const {
    className,
    type,
    mode,
    align,
    renderTabBar,
    tabPaneMotion,
    ...restProps
  } = mergeProps(props, defaultProps);

  const renderCustomTabBar = (
    tabType: TabOriginType,
    tabBarProps: TabsBarProps,
    DefaultTabBar,
  ) => (
    <div className={`coz-tab-bar-${tabType}`}>
      <DefaultTabBar {...tabBarProps} />
    </div>
  );

  const cls = cn(
    tabBarVariants({
      align,
      mode,
    }),
    className,
  );

  const tabType = tabTypeMap[type ?? 'button'];

  return (
    <SemiTabs
      ref={ref}
      type={tabType}
      className={cls}
      tabPaneMotion={tabPaneMotion}
      renderTabBar={(tabBarProps, DefaultTabBar) =>
        renderCustomTabBar(tabType, tabBarProps, DefaultTabBar)
      }
      {...restProps}
    />
  );
});

Tabs.displayName = 'TabBar';

export const TabBar = Object.assign(Tabs, {
  TabPanel: TabBarPanel,
});
