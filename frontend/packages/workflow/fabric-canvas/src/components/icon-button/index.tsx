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
import {
  IconButton,
  type ButtonProps,
  type SemiButton,
} from '@coze-arch/coze-design';

import styles from './index.module.less';

/**
 * On the basis of size: small, overlay padding, 5px - > 4px
 */
export const MyIconButton = forwardRef<
  SemiButton,
  ButtonProps & { inForm?: boolean }
>((props, ref) => {
  const {
    className = '',
    inForm = false,
    color = 'secondary',
    ...rest
  } = props;
  return (
    <IconButton
      ref={ref}
      className={classNames(
        [styles['icon-button']],
        {
          '!p-[4px]': !inForm,
          '!p-[8px] !w-[32px] !h-[32px]': inForm,
          [styles['coz-fg-secondary']]: color === 'secondary',
        },
        className,
      )}
      size="small"
      color={color}
      {...rest}
    />
  );
});
