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
