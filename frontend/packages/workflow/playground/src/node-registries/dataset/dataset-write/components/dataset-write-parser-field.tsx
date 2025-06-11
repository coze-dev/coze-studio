import React from 'react';

import { DatasetWriteParser as BaseDatasetWriteParser } from '@/form-extensions/components/dataset-write-parser';
import { useField, withField } from '@/form';

const DatasetWriteParser = props => {
  const { name, value, onChange, readonly } = useField<string[]>();

  return (
    <BaseDatasetWriteParser
      value={value as string[]}
      onChange={onChange}
      readonly={!!readonly}
      context={{
        meta: {
          name,
        },
      }}
      {...props}
    />
  );
};

export const DatasetWriteParserField = withField(DatasetWriteParser);
