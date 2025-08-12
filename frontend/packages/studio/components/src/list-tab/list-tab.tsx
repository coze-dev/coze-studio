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

import { type PropsWithChildren, type ReactNode } from 'react';

import cs from 'classnames';
import { type TabsProps } from '@coze-arch/bot-semi/Tabs';
import { Tabs } from '@coze-arch/bot-semi';

import s from './index.module.less';

export interface BotListHeaderProps extends TabsProps {
  toolbar?: ReactNode;
  containerClass?: string;
}

export const ListTab: React.FC<PropsWithChildren<BotListHeaderProps>> = ({
  children,
  toolbar,
  containerClass,
  ...props
}) => (
  <Tabs
    {...props}
    tabPaneMotion={false}
    type="button"
    // eslint-disable-next-line @typescript-eslint/naming-convention -- react component
    renderTabBar={(innerProps, Node) => (
      <div className={cs(s.header, containerClass)}>
        <Node {...innerProps} />
        <div className={s['tool-bar']}>{toolbar}</div>
      </div>
    )}
  >
    {children}
  </Tabs>
);
