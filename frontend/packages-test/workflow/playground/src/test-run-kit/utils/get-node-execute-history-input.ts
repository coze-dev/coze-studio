import { invert } from 'lodash-es';
import {
  safeJsonParse,
  TestFormFieldName,
  stringifyFormValuesFromBacked,
} from '@coze-workflow/test-run-next';
import { workflowApi, StandardNodeType } from '@coze-workflow/base';
import { NodeHistoryScene } from '@coze-arch/bot-api/workflow_api';

interface GetNodeExecuteHistoryInputOptions {
  workflowId: string;
  spaceId: string;
  nodeId: string;
  nodeType: string;
}

export const getNodeExecuteHistoryInput = async (
  options: GetNodeExecuteHistoryInputOptions,
) => {
  const { spaceId, workflowId, nodeId, nodeType } = options;
  const map = invert(StandardNodeType);
  const nodeTypeStr = map[nodeType];
  if (!nodeId || !nodeTypeStr) {
    return;
  }
  try {
    const res = await workflowApi.GetNodeExecuteHistory({
      workflow_id: workflowId,
      space_id: spaceId,
      node_id: nodeId,
      node_type: nodeTypeStr,
      execute_id: '',
      node_history_scene: NodeHistoryScene.TestRunInput,
    });
    const inputValues = safeJsonParse(res.data?.input);
    if (inputValues) {
      return {
        [TestFormFieldName.Node]: {
          [TestFormFieldName.Input]: stringifyFormValuesFromBacked(inputValues),
        },
      };
    }
    // eslint-disable-next-line @coze-arch/no-empty-catch
  } catch {
    //
  }
};
