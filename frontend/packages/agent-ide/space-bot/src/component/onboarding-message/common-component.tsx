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

import { type FC, type PropsWithChildren, type ReactNode } from 'react';

import classNames from 'classnames';
import { Tooltip } from '@coze-arch/coze-design';
import { IconInfo } from '@coze-arch/bot-icons';

import s from './index.module.less';

export const ToolTipNode: FC<
  PropsWithChildren<{
    content: ReactNode;
    className?: string;
    tipContentClassName?: string;
  }>
> = ({ content, children, className, tipContentClassName }) => (
  <Tooltip
    className={tipContentClassName}
    content={<div className={classNames(s['tip-content'])}>{content}</div>}
  >
    <div className={classNames(className, 'flex items-center')}>
      <IconInfo
        className={classNames(
          s['icon-info'],
          'cursor-pointer coz-fg-secondary',
        )}
      />
      {children}
    </div>
  </Tooltip>
);
