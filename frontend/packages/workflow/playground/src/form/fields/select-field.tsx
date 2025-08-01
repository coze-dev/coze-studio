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

import { useField } from '../hooks';
import { withField } from '../hocs';
import {
  type FieldProps,
  Select,
  type SelectProps as BaseSelectProps,
} from '../components';

type SelectProps = Omit<
  BaseSelectProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus' | 'hasError'
>;

export const SelectField: React.FC<SelectProps & FieldProps> =
  withField<SelectProps>(props => {
    const { value, onChange, onBlur, errors, readonly } = useField<
      string | number
    >();

    return (
      <Select
        {...props}
        disabled={readonly}
        value={value}
        onChange={v => onChange(v as string | number)}
        onBlur={onBlur}
        hasError={errors && errors.length > 0}
      />
    );
  });
