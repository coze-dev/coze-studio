import React from 'react';

import { useDataSetInfos } from '@/hooks';
import { type DataSetInfo } from '@/form-extensions/components/dataset-setting/type';
import { DataSetSetting as BaseDatasetSetting } from '@/form-extensions/components/dataset-setting';
import { useField, useWatch, withField } from '@/form';

const DatasetSetting = () => {
  const { value, onChange, onBlur, readonly } = useField<DataSetInfo>();
  const selectDataSet = useWatch<string[]>(
    'inputs.datasetParameters.datasetParam',
  );

  const { dataSets, isReady } = useDataSetInfos({ ids: selectDataSet });

  return (
    <BaseDatasetSetting
      dataSetInfo={value as DataSetInfo}
      onDataSetInfoChange={(v: DataSetInfo) => {
        onChange(v);
        onBlur?.();
      }}
      readonly={!!readonly}
      dataSets={dataSets}
      isReady={isReady}
    />
  );
};

export const DatasetSettingField = withField(DatasetSetting);
