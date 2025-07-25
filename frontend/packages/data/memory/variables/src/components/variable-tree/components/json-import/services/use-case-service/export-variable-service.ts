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
 
import { type VariableChannel } from '@coze-arch/bot-api/memory';

import { type ViewVariableType } from '@/store/variable-groups/types';
import { useVariableGroupsStore } from '@/store/variable-groups/store';
import { type Variable } from '@/store';

import { type SchemaNode } from '../../../json-editor/service/convert-schema-service';

/**
 * 将转换后的数据转换为Variable
 * @param data 转换后的数据
 * @param baseInfo 基础信息
 * @param originalVariable 原始变量，用于保持variableId
 * @returns Variable[]
 */
export const exportVariableService = (
  data: SchemaNode[],
  baseInfo: {
    groupId: string;
    channel: VariableChannel;
  },
  originalVariable?: Variable,
): Variable[] => {
  const store = useVariableGroupsStore.getState();

  const convertNode = (
    node: SchemaNode,
    parentId = '',
    originalNode?: Variable,
  ): Variable => {
    // 使用store中的createVariable方法创建基础变量
    const baseVariable = store.createVariable({
      variableType: node.type as ViewVariableType,
      groupId: baseInfo.groupId,
      parentId,
      channel: baseInfo.channel,
    });

    // 如果存在原始节点，保持其variableId
    if (originalNode) {
      baseVariable.variableId = originalNode.variableId;
      baseVariable.description = originalNode.description;
    }

    // 更新变量的基本信息
    baseVariable.name = node.name;
    baseVariable.defaultValue = node.defaultValue;

    // 递归处理子节点，尝试匹配原始子节点
    if (node.children?.length) {
      baseVariable.children = node.children.map((child, index) => {
        const originalChild = originalNode?.children?.[index];
        return convertNode(child, baseVariable.variableId, originalChild);
      });
    }

    return baseVariable;
  };

  const variables = data.map(node => convertNode(node, '', originalVariable));

  // 使用store中的updateMeta方法更新meta信息
  store.updateMeta({ variables });

  return variables;
};
