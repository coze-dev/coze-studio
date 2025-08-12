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

import { forwardRef } from 'react';

import classNames from 'classnames';
import { IconButton, type ButtonProps } from '@coze-arch/coze-design';
import { type Button as SemiButton } from '@douyinfe/semi-ui';

import styles from './index.module.less';

export const OutlinedIconButton = forwardRef<
  SemiButton,
  ButtonProps & { showBackground: boolean }
>(({ className, showBackground, ...restProps }, ref) => (
  <IconButton
    ref={ref}
    className={classNames(
      className,
      showBackground
        ? ['!coz-bg-image-bots', styles['outlined-icon-button-background']]
        : styles['outlined-icon-button'],
      styles['base-outlined-icon-button'],
    )}
    {...restProps}
  />
));
