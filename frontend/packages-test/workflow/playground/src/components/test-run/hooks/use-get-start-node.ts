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
