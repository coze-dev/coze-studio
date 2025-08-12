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
  Switch,
  type SwitchProps as BaseSwitchProps,
} from '@coze-arch/coze-design';

import { useField } from '../hooks';
import { withField } from '../hocs';
import { type FieldProps } from '../components';

type SwitchProps = Omit<
  BaseSwitchProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus'
>;

export const SwitchField: React.FC<SwitchProps & FieldProps> =
  withField<SwitchProps>(props => {
    const { value, onChange, readonly } = useField<boolean>();

    return (
      <Switch
        {...props}
        disabled={readonly}
        checked={value}
        onChange={onChange}
      />
    );
  });
