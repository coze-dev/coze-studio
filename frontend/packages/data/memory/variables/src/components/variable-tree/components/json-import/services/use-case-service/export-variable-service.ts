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
 * Converting Converted Data to Variables
 * @param data converted data
 * @param baseInfo
 * @param originalVariable to hold variableId
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
    // Create the underlying variable using the createVariable method in the store
    const baseVariable = store.createVariable({
      variableType: node.type as ViewVariableType,
      groupId: baseInfo.groupId,
      parentId,
      channel: baseInfo.channel,
    });

    // If the original node exists, keep its variableId.
    if (originalNode) {
      baseVariable.variableId = originalNode.variableId;
      baseVariable.description = originalNode.description;
    }

    // Update basic information about variables
    baseVariable.name = node.name;
    baseVariable.defaultValue = node.defaultValue;

    // Recursively process the sub-node and try to match the original sub-node.
    if (node.children?.length) {
      baseVariable.children = node.children.map((child, index) => {
        const originalChild = originalNode?.children?.[index];
        return convertNode(child, baseVariable.variableId, originalChild);
      });
    }

    return baseVariable;
  };

  const variables = data.map(node => convertNode(node, '', originalVariable));

  // Update meta information using the updateMeta method in the store
  store.updateMeta({ variables });

  return variables;
};
