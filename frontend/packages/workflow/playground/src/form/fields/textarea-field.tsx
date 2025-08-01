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

import cx from 'classnames';
import { TextArea, type TextAreaProps } from '@coze-arch/coze-design';

import { useField } from '../hooks';
import { withField } from '../hocs';

type TextareaProps = Omit<TextAreaProps, 'value' | 'onChange'>;

export const TextareaField = withField(
  ({ className = '', ...props }: TextareaProps) => {
    const { value, onChange, readonly = false } = useField<string>();

    return (
      <TextArea
        className={cx(
          className,
          'w-full',
          readonly ? 'pointer-events-none' : '',
        )}
        value={value}
        onChange={v => onChange?.(v)}
        {...props}
      />
    );
  },
);
