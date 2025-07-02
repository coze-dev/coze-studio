import { PropsWithChildren } from 'react';

import cs from 'classnames';
import { TabsProps } from '@douyinfe/semi-ui/lib/es/tabs';
import { Tabs } from '@douyinfe/semi-ui';

import s from './index.module.less';

export interface UITabBarProps extends TabsProps {
  wrapperClass?: string;
  containerClass?: string;
  theme?: 'black' | 'blue';
}

export const UITabBar: React.FC<PropsWithChildren<UITabBarProps>> = ({
  children,
  wrapperClass,
  containerClass,
  theme = 'black',
  ...props
}) => (
  <div className={cs(s['ui-tab-bar'], s[`tab-bar-${theme}`], wrapperClass)}>
    <Tabs
      {...props}
      tabPaneMotion={false}
      type="button"
      // eslint-disable-next-line @typescript-eslint/naming-convention -- react comp
      renderTabBar={(innerProps, Node) => (
        <div className={cs(s.header, containerClass)}>
          <Node {...innerProps} />

          {/* 右侧工具栏，没有可不传children */}
          <div className={s['tool-bar']}>{children}</div>
        </div>
      )}
    ></Tabs>
  </div>
);
export default UITabBar;
