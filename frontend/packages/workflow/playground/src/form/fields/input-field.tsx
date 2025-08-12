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

import {
  Input,
  type InputProps as BaseInputProps,
} from '@coze-arch/coze-design';

import { useField } from '../hooks';
import { withField } from '../hocs';
import { type FieldProps } from '../components';

type InputProps = Omit<
  BaseInputProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus'
>;

export const InputField: React.FC<InputProps & FieldProps> =
  withField<InputProps>(props => {
    const { value, onChange, onBlur, errors } = useField<string>();

    return (
      <Input
        {...props}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        size="small"
        error={errors && errors.length > 0}
      />
    );
  });
