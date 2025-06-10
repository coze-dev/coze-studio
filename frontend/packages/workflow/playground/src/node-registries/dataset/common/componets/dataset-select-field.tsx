import React from 'react';

import { DatasetSelect as BaseDatasetSelect } from '@/form-extensions/components/dataset-select';
import { useField, withField } from '@/form';

const DatasetSelect = () => {
  const { value, onChange, readonly, onBlur } = useField<string[]>();

  return (
    <BaseDatasetSelect
      value={value as string[]}
      onChange={v => {
        onChange(v);
        onBlur?.();
      }}
      readonly={!!readonly}
    />
  );
};

export const DatasetSelectField = withField(DatasetSelect);
