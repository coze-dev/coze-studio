import { useCallback, useEffect, useRef } from 'react';

import { StandardNodeType } from '@coze-workflow/base';
import { ComponentType } from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import { generateTestsetData } from '../utils/generate-testset-data';
import { WorkflowRunService } from '../../../services';
import { useTestsetBizCtx } from './use-testset-biz-ctx';

const nodeType2ComponentType = (nodeType: StandardNodeType) => {
  switch (nodeType) {
    case StandardNodeType.SubWorkflow:
      return ComponentType.CozeSubWorkflow;
    case StandardNodeType.LLM:
      return ComponentType.CozeLLMNode;
    case StandardNodeType.Code:
      return ComponentType.CozeCodeNode;
    case StandardNodeType.Dataset:
      return ComponentType.CozeKnowledgeNode;
    case StandardNodeType.DatasetWrite:
      return ComponentType.CozeKnowledgeNode;
    case StandardNodeType.Api:
      return ComponentType.CozeToolNode;
    case StandardNodeType.Variable:
      return ComponentType.CozeVariableNode;
    case StandardNodeType.Start:
      return ComponentType.CozeStartNode;
    default:
      return ComponentType.Undefined;
  }
};

const useAutoGen = () => {
  const bizCtx = useTestsetBizCtx();
  const runService = useService<WorkflowRunService>(WorkflowRunService);

  const abortRef = useRef<AbortController | null>(null);

  const autoGen = useCallback(
    async (node: WorkflowNodeEntity) => {
      const { workflowId } = runService.globalState.config;
      abortRef.current = new AbortController();
      const { genCaseData } = await debuggerApi.AutoGenerateCaseData(
        {
          bizComponentSubject: {
            componentType: nodeType2ComponentType(
              node.flowNodeType as StandardNodeType,
            ),
            componentID: node.id,
            parentComponentID: workflowId,
            parentComponentType: ComponentType.CozeWorkflow,
          },
          bizCtx,
          count: 1,
        },
        { signal: abortRef.current.signal },
      );
      return generateTestsetData({ caseBase: genCaseData?.[0] });
    },
    [bizCtx],
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    runService.testFormState.autoGenerating = false;
  }, []);

  useEffect(
    () => () => {
      abort();
    },
    [],
  );

  return {
    autoGen,
    abort,
  };
};

export { useAutoGen };
