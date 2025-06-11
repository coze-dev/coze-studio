import { forwardRef } from 'react';

import { TabPane } from '@douyinfe/semi-ui';

import { cn, mergeProps } from '@/utils';

import { type TabsBarPanelProps } from './tab-bar-types';

import './index.css';

const defaultProps: Partial<TabsBarPanelProps> = {};

export const TabBarPanel = forwardRef<TabPane, TabsBarPanelProps>(
  (props, ref) => {
    const { className, ...restProps } = mergeProps(props, defaultProps);
    const cls = cn('coz-tab-bar-content', className);
    return <TabPane className={cls} ref={ref} {...restProps} />;
  },
);

TabBarPanel.displayName = 'TabBarPanel';
