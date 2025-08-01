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

import { type FC } from 'react';

import { cloneDeep } from 'lodash-es';
import {
  type APIParameter,
  ParameterType,
} from '@coze-arch/bot-api/plugin_develop';

import { deleteAllChildNode } from '../../utils';
import {
  type AddChildNodeFn,
  type APIParameterRecord,
  type UpdateNodeWithDataFn,
} from '../../types/params';
import {
  ARRAYTAG,
  getParameterTypeLabelFromRecord,
  ParameterTypeExtend,
  ROWKEY,
} from '../../config';
import { CascaderItem } from '../../components/cascader-item';
import { type ColumnsProps } from '..';

interface ParamTypeProps
  extends Pick<
    ColumnsProps,
    'data' | 'setData' | 'disabled' | 'checkFlag' | 'isResponse'
  > {
  record: APIParameterRecord;
  updateNodeWithData: UpdateNodeWithDataFn;
  addChildNode: AddChildNodeFn;
  enableFileType?: boolean;
}

const ParamTypeColRender: FC<ParamTypeProps> = ({
  record,
  disabled,
  data,
  setData,
  checkFlag,
  isResponse,
  updateNodeWithData,
  addChildNode,
  enableFileType = false,
}) => {
  // Delete all sub-nodes;
  const handleDeleteAllChildNode = (r: APIParameter) => {
    const cloneData = cloneDeep(data);
    const delStatus = deleteAllChildNode(cloneData, r[ROWKEY] as string);
    if (delStatus) {
      setData(cloneData);
    }
  };

  if (disabled) {
    return (
      <>{getParameterTypeLabelFromRecord(record, record.name === ARRAYTAG)}</>
    );
  }

  return (
    <CascaderItem
      check={checkFlag}
      record={record}
      enableFileType={enableFileType}
      selectCallback={([cascaderType, assistType]) => {
        let type = cascaderType;
        if (cascaderType === ParameterTypeExtend.DEFAULT) {
          type = ParameterType.String;
        }

        if (!isResponse) {
          // Switch type, reset default value
          if (record.global_default) {
            updateNodeWithData({
              record,
              key: ['global_default', 'global_disable'],
              value: ['', false],
              updateData: true,
            });
          }
        }

        const payload = {
          record,
          key: ['type', 'assist_type'],
          value: [type, assistType ?? null],
        };

        // updateNodeWithData will change the type type and keep the original type.
        const recordType = record?.type;

        if (type === ParameterType.Array) {
          updateNodeWithData({
            ...payload,
            updateData: true,
          });
          addChildNode({ record, isArray: true, type, recordType });
        } else if (type === ParameterType.Object) {
          updateNodeWithData({
            ...payload,
            updateData: true,
          });
          addChildNode({ record, isArray: false, type, recordType });
        } else if (
          record?.type === ParameterType.Array ||
          record?.type === ParameterType.Object
        ) {
          updateNodeWithData(payload);
          handleDeleteAllChildNode(record);
        } else {
          updateNodeWithData({
            ...payload,
            updateData: true,
          });
        }
      }}
    />
  );
};

export default ParamTypeColRender;
