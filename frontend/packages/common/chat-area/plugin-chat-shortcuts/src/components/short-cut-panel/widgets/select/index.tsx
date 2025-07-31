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

import { type SelectProps } from '@coze-arch/bot-semi/Select';
import { UIFormSelect } from '@coze-arch/bot-semi';

import { type DSLFormFieldCommonProps, type DSLComponent } from '../types';
import { LabelWithDescription } from '../label-with-desc';

export const DSLFormSelect: DSLComponent<
  DSLFormFieldCommonProps & Pick<SelectProps, 'optionList'>
> = ({
  context: { readonly },
  props: { name, description, defaultValue, ...props },
}) => {
  const required = !defaultValue?.value;

  return (
    <div>
      <LabelWithDescription
        name={name}
        description={description}
        required={required}
      />
      <UIFormSelect
        disabled={readonly}
        fieldStyle={{ padding: 0 }}
        className="w-full"
        field={name}
        initValue={defaultValue?.value}
        noLabel
        {...props}
      />
    </div>
  );
};
