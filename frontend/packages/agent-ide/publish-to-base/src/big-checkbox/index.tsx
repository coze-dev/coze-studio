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

import classnames from 'classnames';
import { Checkbox } from '@coze-arch/coze-design';

import styles from './index.module.less';

type CheckboxProps = Parameters<typeof Checkbox>[0] & {
  isError?: boolean;
  size?: 'large';
};

export const BigCheckbox: FC<CheckboxProps> = ({
  isError,
  children,
  className,
  size = 'large',
  ...rest
}) => (
  <Checkbox
    className={classnames(
      className,
      isError && styles.error_checkbox,
      size === 'large' && styles.large,
    )}
    {...rest}
  >
    {children}
  </Checkbox>
);
