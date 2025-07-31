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
  Checkbox,
  type CheckboxProps as BaseCheckboxProps,
} from '@coze-arch/coze-design';

import { withField, useField } from '@/form';

type CheckboxProps = Omit<
  BaseCheckboxProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus'
>;

export const CheckboxField = withField<CheckboxProps>(props => {
  const { value, onChange } = useField<boolean>();

  return (
    <div className="flex h-[24px] items-center">
      <Checkbox
        {...props}
        value={value}
        onChange={e => onChange(!!e.target.checked)}
      />
    </div>
  );
});
