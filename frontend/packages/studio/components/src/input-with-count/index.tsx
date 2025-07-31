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

import { useMemo } from 'react';

import { type InputProps } from '@coze-arch/bot-semi/Input';
import { UIInput, withField } from '@coze-arch/bot-semi';
import 'utility-types';

import s from './index.module.less';

interface LimitCountProps {
  maxLen: number;
  len: number;
}

const LimitCount: React.FC<LimitCountProps> = ({ maxLen, len }) => (
  <span className={s['limit-count']}>
    <span>{len}</span>
    <span>/</span>
    <span>{maxLen}</span>
  </span>
);

export interface InputWithCountProps extends InputProps {
  // Set word limits and display word count
  getValueLength?: (value?: InputProps['value'] | string) => number;
}

export const InputWithCount: React.FC<InputWithCountProps> = props => {
  const { value, maxLength, getValueLength } = props;

  const len = useMemo(() => {
    if (getValueLength) {
      return getValueLength(value);
    } else if (value) {
      return value.toString().length;
    } else {
      return 0;
    }
  }, [value, getValueLength]);

  return (
    <UIInput
      {...props}
      suffix={
        Boolean(maxLength) && <LimitCount maxLen={maxLength ?? 0} len={len} />
      }
    />
  );
};

export const InputWithCountField = withField(InputWithCount);
