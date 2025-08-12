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

import { type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { RadioGroup, type RadioGroupProps } from '@coze-arch/coze-design';

import styles from './index.module.less';

export type CardRadioGroupProps<T = unknown> = PropsWithChildren<
  Pick<RadioGroupProps, 'value' | 'className'>
> & {
  onChange?: (value: T) => void;
};

/**
 * Always use the card style and conform to the UI design style {@link RadioGroup}
 */
export function CardRadioGroup<T = unknown>({
  value,
  onChange,
  className,
  children,
}: CardRadioGroupProps<T>) {
  return (
    <RadioGroup
      type="pureCard"
      direction="vertical"
      value={value}
      onChange={e => {
        onChange?.(e.target.value as T);
      }}
      className={classNames(styles['card-radio-group'], className)}
    >
      {children}
    </RadioGroup>
  );
}
