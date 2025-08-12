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
      // The workflow in the application does not have a version, or in other cases without a version number, it is directly refreshed
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
