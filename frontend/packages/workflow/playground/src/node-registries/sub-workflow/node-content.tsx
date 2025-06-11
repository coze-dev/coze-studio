import { useEffect } from 'react';

import {
  useCurrentEntity,
  useService,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodeData } from '@coze-workflow/nodes';
import {
  type StandardNodeType,
  useWorkflowNode,
  type WorkflowDetailInfoData,
} from '@coze-workflow/base';

import { WorkflowPlaygroundContext } from '@/workflow-playground-context';
import { recreateNodeForm } from '@/services/node-version-service';
import { useDependencyService } from '@/hooks';

import { InputParameters, Outputs } from '../common/components';
import { getIdentifier } from './utils';
import { useSubWorkflowNodeService } from './hooks';

export function SubWorkflowContent() {
  const dependencyService = useDependencyService();
  const playgroundContext = useService<WorkflowPlaygroundContext>(
    WorkflowPlaygroundContext,
  );
  const { data } = useWorkflowNode();
  const node = useCurrentEntity();
  const nodeDataEntity = node?.getData<WorkflowNodeData>(WorkflowNodeData);
  const nodeData = nodeDataEntity.getNodeData<StandardNodeType.SubWorkflow>();

  const identifier = getIdentifier(data?.inputs);
  const subWorkflowService = useSubWorkflowNodeService();

  useEffect(() => {
    if (!identifier) {
      return;
    }

    const disposable = dependencyService.onDependencyChange(async props => {
      if (!props?.extra?.nodeIds?.includes(data?.inputs?.workflowId)) {
        return;
      }
      await subWorkflowService.load(identifier, data?.nodeMeta?.title);
      const subWorkflowDetail = subWorkflowService.getApiDetail(
        identifier,
      ) as WorkflowDetailInfoData;
      // 应用内的工作流不带版本 或 其他没有版本号的情况，直接刷新
      if (subWorkflowDetail?.project_id || !subWorkflowDetail?.flow_version) {
        recreateNodeForm(node, playgroundContext);
        return;
      }
      nodeDataEntity.init();
      nodeDataEntity.setNodeData<StandardNodeType.SubWorkflow>({
        ...nodeData,
        latest_flow_version: subWorkflowDetail?.latest_flow_version,
        latest_flow_version_desc: subWorkflowDetail?.latest_flow_version_desc,
        latestVersion: subWorkflowDetail?.latest_flow_version,
      });
      dependencyService.onSubWrokflowVersionChangeEmitter.fire({
        subWorkflowId: data?.inputs?.workflowId,
      });
    });

    return () => {
      disposable?.dispose?.();
    };
  }, [identifier, data?.inputs?.workflowId]);

  return (
    <>
      <InputParameters />
      <Outputs />
    </>
  );
}
