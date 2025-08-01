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

import type {
  PlaygroundContext,
  WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import {
  type RefExpression,
  type ViewVariableMeta,
  type ViewVariableType,
  WorkflowNode,
} from '@coze-workflow/base';

export const getLeftRightVariable = (params: {
  node: WorkflowNodeEntity;
  name: string;
  playgroundContext: PlaygroundContext;
}): {
  left: ViewVariableMeta;
  right: ViewVariableMeta;
  leftPath?: string[];
  rightPath?: string[];
  leftType?: ViewVariableType;
  rightType?: ViewVariableType;
} => {
  const { node, playgroundContext, name } = params;
  const workflowNode = new WorkflowNode(node);

  const index = Number(name.slice(23, 24));

  const left = workflowNode.getValueByPath<RefExpression>(
    `inputs.inputParameters.${index}.left`,
  );
  const right = workflowNode.getValueByPath<RefExpression>(
    `inputs.inputParameters.${index}.right`,
  );
  const leftKeyPath = left?.content?.keyPath ?? [];
  const rightKeyPath = right?.content?.keyPath ?? [];

  const leftVariable =
    playgroundContext.variableService.getViewVariableByKeyPath(leftKeyPath, {
      node,
    });

  const rightVariable =
    playgroundContext.variableService.getViewVariableByKeyPath(rightKeyPath, {
      node,
    });

  return {
    left: leftVariable,
    right: rightVariable,
    leftPath: left?.content?.keyPath,
    rightPath: right?.content?.keyPath,
    leftType: left.rawMeta?.type ?? leftVariable?.type,
    rightType: right.rawMeta?.type ?? rightVariable?.type,
  };
};
