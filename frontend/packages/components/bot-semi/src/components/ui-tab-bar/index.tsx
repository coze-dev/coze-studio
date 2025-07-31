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

          {/* Right toolbar, no children can be passed on. */}
          <div className={s['tool-bar']}>{children}</div>
        </div>
      )}
    ></Tabs>
  </div>
);
export default UITabBar;
