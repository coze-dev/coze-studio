import { type RuleItem } from '@coze-arch/bot-semi/Form';
import { Form } from '@coze-arch/bot-semi';

import { type DSLFormFieldCommonProps, type DSLComponent } from '../types';
import { LabelWithDescription } from '../label-with-desc';

const parseRules = (rules: RuleItem[]): RuleItem[] =>
  rules.map(rule => {
    if (rule.required) {
      return {
        ...rule,
        //  required 情况下，禁止输入空格
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
