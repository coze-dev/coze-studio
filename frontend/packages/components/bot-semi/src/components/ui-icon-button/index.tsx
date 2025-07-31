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

import { LegacyRef, forwardRef } from 'react';

import cs from 'classnames';
import { ButtonProps } from '@douyinfe/semi-ui/lib/es/button';
import { Button } from '@douyinfe/semi-ui';

import s from './index.module.less';

export interface UIIconButtonProps extends ButtonProps {
  wrapperClass?: string;
  /**
   * iconSize: with hover size, small: 18, default: 24, large: 32
   */
  iconSize?: 'small' | 'default' | 'large';
}

//icon button component
export const UIIconButton = forwardRef(
  (
    {
      className,
      wrapperClass,
      iconSize = 'default',
      ...props
    }: UIIconButtonProps,
    ref: LegacyRef<Button>,
  ) => (
    <div
      className={cs(
        s['icon-button'],
        s[`icon-button-${iconSize}`],
        wrapperClass,
      )}
    >
      <Button
        ref={ref}
        className={cs(className)}
        {...props}
        size="small"
        theme="borderless"
      />
    </div>
  ),
);
export default UIIconButton;
