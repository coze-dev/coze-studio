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
