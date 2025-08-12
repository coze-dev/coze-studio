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
// import { type TooltipProps } from '@douyinfe/semi-ui/lib/es/tooltip';

type IProps = {
  children: JSX.Element;
  hideToolTip?: boolean;
} & TooltipProps;

export const UIKitTooltip: FC<IProps> = props => {
  const {
    content,
    children,
    hideToolTip,
    theme = 'dark',
    ...restProps
  } = props;
  return content ? (
    <Tooltip
      trigger={hideToolTip ? 'custom' : 'hover'}
      visible={hideToolTip ? false : undefined}
      content={content}
      theme={theme}
      {...restProps}
      style={{ marginBottom: '8px' }}
    >
      {children}
    </Tooltip>
  ) : (
    <>{children}</>
  );
};

UIKitTooltip.displayName = 'UIKitTooltip';
