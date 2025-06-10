import React from 'react';

import { useWorkflowNode } from '@coze-workflow/base';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { useDataSetInfos } from '@/hooks';

import { type DataSetInfo } from '../../components/dataset-setting/type';
import { DataSetSetting as BaseDataSetSetting } from '../../components/dataset-setting';

const DatasetSetting = ({
  value,
  onChange,
  options,
  readonly: workflowReadonly,
}: SetterComponentProps<DataSetInfo>) => {
  const { readonly = false, disabled = false, style = {}, ...props } = options;

  const { data } = useWorkflowNode();
  const selectDataSet = data.inputs?.datasetParameters?.datasetParam ?? [];

  const { dataSets, isReady } = useDataSetInfos({ ids: selectDataSet });

  return (
    <BaseDataSetSetting
      {...props}
      readonly={readonly || workflowReadonly}
      disabled={disabled}
      style={style}
      onDataSetInfoChange={onChange}
      dataSets={dataSets}
      dataSetInfo={value}
      isReady={isReady}
    />
  );
};

export const DatasetSettingSetter = {
  key: 'DatasetSetting',
  component: DatasetSetting,
};
