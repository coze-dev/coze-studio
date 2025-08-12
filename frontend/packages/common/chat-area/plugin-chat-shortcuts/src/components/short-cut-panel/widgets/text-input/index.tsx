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

import { type RuleItem } from '@coze-arch/bot-semi/Form';
import { Form } from '@coze-arch/bot-semi';

import { type DSLFormFieldCommonProps, type DSLComponent } from '../types';
import { LabelWithDescription } from '../label-with-desc';

const parseRules = (rules: RuleItem[]): RuleItem[] =>
  rules.map(rule => {
    if (rule.required) {
      return {
        ...rule,
        //  Do not enter spaces if required
        validator: (r, v) => !!v?.trim(),
      };
    }
    return rule;
  });

export const DSLFormInput: DSLComponent<DSLFormFieldCommonProps> = ({
  context: { readonly },
  props: { name, description, rules, defaultValue, ...props },
}) => {
  const required = !defaultValue?.value;

  return (
    <div>
      <LabelWithDescription
        required={required}
        name={name}
        description={description}
      />
      <Form.Input
        disabled={readonly}
        fieldStyle={{ padding: 0 }}
        placeholder={defaultValue?.value}
        className="w-full"
        field={name}
        noLabel
        rules={parseRules(rules)}
        {...props}
      />
    </div>
  );
};
