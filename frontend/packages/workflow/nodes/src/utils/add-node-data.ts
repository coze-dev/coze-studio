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

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  type BasicStandardNodeTypes,
  type StandardNodeType,
} from '@coze-workflow/base/types';

import { type PlaygroundContext } from '../typings';
import { type NodeData, WorkflowNodeData } from '../entity-datas';

/**
 *
 * @param node
 * @param data
 * Set the node data for the basic type node, do not modify it at will
 */
export const addBasicNodeData = (
  node: FlowNodeEntity,
  playgroundContext: PlaygroundContext,
) => {
  const nodeDataEntity = node.getData<WorkflowNodeData>(WorkflowNodeData);
  const meta = playgroundContext.getNodeTemplateInfoByType(
    node.flowNodeType as StandardNodeType,
  );
  const nodeData = nodeDataEntity.getNodeData<keyof NodeData>();

  // The formMeta method on some nodes will be executed repeatedly, so add a check here
  if (!nodeData && meta) {
    nodeDataEntity.setNodeData<BasicStandardNodeTypes>({
      icon: meta.icon,
      description: meta.description,
      title: meta.title,
      mainColor: meta.mainColor,
    });
  }
};
