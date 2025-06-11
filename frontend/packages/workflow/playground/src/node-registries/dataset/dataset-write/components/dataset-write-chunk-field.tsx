import React from 'react';

import { useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import {
  DatasetWriteChunk as BaseDatasetWriteChunk,
  type ChunkValue,
} from '@/form-extensions/components/dataset-write-chunk';
import { InputField, useField, withField } from '@/form';

const DatasetWriteChunk = props => {
  const { name, value, onChange, onBlur, readonly } = useField<ChunkValue>();
  const { getNodeSetterId } = useNodeTestId();

  return (
    <BaseDatasetWriteChunk
      value={value as ChunkValue}
      onChange={(v: ChunkValue) => {
        onChange(v);
        onBlur?.();
      }}
      readonly={!!readonly}
      context={{
        meta: {
          name,
        },
      }}
      customInputComp={
        <InputField
          name="inputs.datasetWriteParameters.chunkStrategy.separator"
          style={{
            fontSize: '12px',
            width: '100%',
          }}
          placeholder={I18n.t('datasets_custom_segmentID_placeholder')}
          data-testid={getNodeSetterId('dataset-write-separator-input')}
        />
      }
      {...props}
    />
  );
};

export const DatasetWriteChunkField = withField(DatasetWriteChunk);
