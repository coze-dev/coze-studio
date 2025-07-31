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

import { type FC } from 'react';

import { Tooltip, type TooltipProps } from '@coze-arch/coze-design';

import s from './index.module.less';

type ToolTooltipsProps = {
  children: JSX.Element;
  hideToolTip?: boolean;
} & TooltipProps;

export const ToolTooltip: FC<ToolTooltipsProps> = props => {
  const { content, children, hideToolTip, ...restProps } = props;
  return content ? (
    <Tooltip
      trigger={hideToolTip ? 'custom' : 'hover'}
      visible={hideToolTip ? false : undefined}
      content={content}
      className={s['tool-tooltips']}
      {...restProps}
    >
      {children}
    </Tooltip>
  ) : (
    <>{children}</>
  );
};
