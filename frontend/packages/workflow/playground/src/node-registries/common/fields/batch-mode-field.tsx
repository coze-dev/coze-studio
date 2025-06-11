import React from 'react';

import { BatchMode } from '@/nodes-v2/components/batch-mode';
import { useField, withField } from '@/form';

export const BatchModeField = withField<{}, string>(() => {
  const { name: fieldName, value, onChange, onBlur } = useField<string>();
  return (
    <BatchMode
      name={fieldName}
      value={value}
      onChange={e => {
        onChange?.((e as React.ChangeEvent<HTMLInputElement>).target.value);
        onBlur?.();
      }}
      onBlur={onBlur}
    />
  );
});
