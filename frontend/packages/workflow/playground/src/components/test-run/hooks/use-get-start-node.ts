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

import { useCallback } from 'react';

import { StandardNodeType } from '@coze-workflow/base';
import { type ViewVariableMeta } from '@coze-workflow/base';
import { type FormModelV2 } from '@flowgram-adapter/free-layout-editor';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';

const useGetStartNode = () => {
  const workflowDocument = useService<WorkflowDocument>(WorkflowDocument);

  const getNode = useCallback(() => {
    const testRunFormNodes = workflowDocument.getAllNodes();
    const startNodeEntity = testRunFormNodes.find(
      n => n.flowNodeType === StandardNodeType.Start,
    );
    return startNodeEntity;
  }, [workflowDocument]);

  return { getNode };
};

const useGetStartNodeOutputs = () => {
  const { getNode } = useGetStartNode();
  const getStartNodeOutputs = (): ViewVariableMeta[] => {
    const startNode = getNode();
    if (!startNode) {
      return [];
    }
    const outputsPath = startNode.getNodeMeta()?.outputsPath ?? '/outputs';
    const formModel = startNode
      .getData<FlowNodeFormData>(FlowNodeFormData)
      .getFormModel<FormModelV2>();
    return formModel?.getValueIn(outputsPath) ?? [];
  };
  return { getStartNodeOutputs };
};

export { useGetStartNode, useGetStartNodeOutputs };
