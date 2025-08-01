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

import { Popover, type PopoverProps } from '@coze-arch/coze-design';

import s from './index.module.less';

type ToolPopoverProps = {
  children: JSX.Element;
  hideToolTip?: boolean;
} & PopoverProps;

export const ToolPopover: FC<ToolPopoverProps> = props => {
  const { content, children, hideToolTip, ...restProps } = props;
  return (
    <Popover
      showArrow
      position="top"
      className={s['tool-popover']}
      trigger={hideToolTip ? 'custom' : 'hover'}
      visible={hideToolTip ? false : undefined}
      content={content}
      style={{ backgroundColor: '#363D4D', padding: 8 }}
      {...restProps}
    >
      {children}
    </Popover>
  );
};
