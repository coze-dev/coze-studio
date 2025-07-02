import React from 'react';

import { Checkbox } from '@/form-extensions/components/checkbox';
import { useField, withField } from '@/form';

export const CheckboxWithTipsField = withField(
  ({ text, itemTooltip }: { text: string; itemTooltip?: string }) => {
    const { name, value, onChange, readonly } = useField<boolean>();
    const context = { meta: { name } };
    const options = {
      text,
      itemTooltip,
    };
    return (
      <Checkbox
        options={options}
        context={context}
        value={!!value}
        onChange={(v: boolean) => onChange(v)}
        readonly={!!readonly}
      />
    );
  },
);
