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

/* eslint-disable @coze-arch/no-deep-relative-import */
import { useEffect, useRef, useMemo } from 'react';

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodeData } from '@coze-workflow/nodes';
import {
  BlockInput,
  StandardNodeType,
  WorkflowNode,
} from '@coze-workflow/base';
import {
  MockSetSelect,
  type MockSetSelectActions,
} from '@coze-devops/mockset-manage';
import { ComponentType, TrafficScene } from '@coze-arch/bot-api/debugger_api';

import { useGlobalState } from '../../../../hooks';

const PluginMockSet = ({
  node,
  readonly,
}: {
  node: FlowNodeEntity;
  readonly?: boolean;
}) => {
  const { workflowId, spaceId, isCollaboratorMode, info } = useGlobalState();
  const ref = useRef<MockSetSelectActions>(null);
  const workflowNode = useMemo(() => new WorkflowNode(node), [node]);

  const { vcsData } = info;

  useEffect(() => {
    const toDispose = node.onDispose(() =>
      ref.current?.handleParentNodeDelete(),
    );

    return () => toDispose.dispose();
  }, []);

  // Non-API node, no rendering required. No test run permission does not show
  if (
    node?.flowNodeType !== StandardNodeType.Api ||
    // collaboration mode no permission
    (isCollaboratorMode && !vcsData?.can_edit) ||
    // Non-collaborative mode only you can see
    (!isCollaboratorMode && !info.creator?.self)
  ) {
    return null;
  }

  const nodeId = node.id;
  const apiParams = workflowNode.data?.inputs?.apiParam ?? [];
  const apiOutputs = node
    .getData(WorkflowNodeData)
    ?.getNodeData<StandardNodeType.Api>()?.outputs;

  const pluginId = BlockInput.toLiteral(
    apiParams.find(param => param.name === 'pluginID'),
  );

  const apiId: string = BlockInput.toLiteral(
    apiParams.find(param => param.name === 'apiID'),
  );

  const apiName: string = BlockInput.toLiteral(
    apiParams.find(param => param.name === 'apiName'),
  );

  return (
    <MockSetSelect
      ref={ref}
      readonly={readonly || apiOutputs === null}
      style={{ maxWidth: 90 }}
      bindSubjectInfo={{
        componentID: nodeId,
        componentType: ComponentType.CozeToolNode,
        parentComponentID: workflowId,
        parentComponentType: ComponentType.CozeWorkflow,
        detail: { name: apiName },
      }}
      bizCtx={{
        trafficScene: TrafficScene.CozeWorkflowDebug,
        trafficCallerID: workflowId,
        bizSpaceID: spaceId,
        ext: {
          mockSubjectInfo: JSON.stringify({
            componentType: ComponentType.CozeTool,
            componentID: apiId,
            parentComponentType: ComponentType.CozePlugin,
            parentComponentID: pluginId,
          }),
        },
      }}
    />
  );
};

export default PluginMockSet;
