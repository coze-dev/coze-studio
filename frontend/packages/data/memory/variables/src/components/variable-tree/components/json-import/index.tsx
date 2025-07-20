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
 
import { useEffect, useState, type FC } from 'react';

import { merge, cloneDeep } from 'lodash-es';

import { type SchemaNode } from '../json-editor/service/convert-schema-service';
import { JSONEditor } from '../json-editor';
import type { TreeNodeCustomData } from '../../type';
import {
  MAX_LEVEL,
  MAX_NAME_LENGTH,
  MAX_JSON_VARIABLE_COUNT,
} from '../../constants';
import { cutOffInvalidData } from './utils/cut-off';
import { exportVariableService } from './services/use-case-service/export-variable-service';
import { getEditorViewVariableJson } from './services/life-cycle-service/init-service';

interface JSONImportProps {
  visible: boolean;
  onCancel: () => void;
  treeData: TreeNodeCustomData;
  rules: {
    jsonImport: boolean;
    readonly: boolean;
  };
  onOk: (value: TreeNodeCustomData) => void;
}

export const JSONImport: FC<JSONImportProps> = props => {
  const { treeData, rules, visible, onCancel, onOk } = props;
  const { jsonImport, readonly } = rules;
  const [jsonString, setJsonString] = useState('');

  const handleImport = (data: SchemaNode[]) => {
    const allowDepth = MAX_LEVEL; // 最大深度限制
    const allowNameLength = MAX_NAME_LENGTH; // 名称长度限制
    const maxVariableCount = MAX_JSON_VARIABLE_COUNT; // 最大变量数量限制
    const variables = exportVariableService(
      data,
      {
        groupId: treeData.groupId,
        channel: treeData.channel,
      },
      treeData, // 传入原始变量以保持variableId
    );

    // 裁切非法数据
    const dataCutoff = cutOffInvalidData({
      data: variables,
      allowDepth,
      allowNameLength,
      maxVariableCount,
    });

    // 先深拷贝原始数据
    const clonedTreeData = cloneDeep(treeData);
    // 合并新旧数据
    const mergedData = merge(clonedTreeData, dataCutoff[0]);

    // 更新数据
    return onOk(mergedData);
  };

  useEffect(() => {
    setJsonString(getEditorViewVariableJson(treeData));
  }, [treeData]);

  if (!jsonImport) {
    return <></>;
  }

  return (
    <JSONEditor
      id={treeData.variableId}
      groupId={treeData.groupId}
      value={jsonString}
      readonly={readonly}
      setValue={(value: string) => {
        setJsonString(value);
      }}
      visible={visible}
      onOk={handleImport}
      onCancel={onCancel}
    />
  );
};
