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

import {
  startTransition,
  type PropsWithChildren,
  useState,
  useEffect,
} from 'react';

import { WorkflowNode, WorkflowNodeContext } from '@coze-workflow/base';
import {
  PlaygroundEntityContext,
  type FlowNodeEntity,
  FlowNodeFormData,
  FlowNodeErrorData,
} from '@flowgram-adapter/free-layout-editor';

import {
  NodeRenderSceneContext,
  type NodeRenderScene,
} from '@/contexts/node-render-context';

interface NodeContextProviderProps {
  node: FlowNodeEntity;
  scene?: NodeRenderScene;
}

export function NodeContextProvider({
  node,
  scene,
  children,
}: PropsWithChildren<NodeContextProviderProps>) {
  const workflowNode = useWorkflowNode(node);
  const [prevErrorMessage, setPrevErrorMessage] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (!workflowNode.data) {
      return;
    }

    const errorMessage = workflowNode.registry?.checkError?.(
      workflowNode.data,
      node.context,
    );

    if (errorMessage !== prevErrorMessage) {
      if (errorMessage) {
        workflowNode.setError({
          name: 'CustomNodeError',
          message: errorMessage,
        });
      }
      setPrevErrorMessage(errorMessage);
    }
  }, [workflowNode]);

  return (
    <NodeRenderSceneContext.Provider value={scene}>
      <WorkflowNodeContext.Provider value={workflowNode}>
        <PlaygroundEntityContext.Provider value={node}>
          {children}
        </PlaygroundEntityContext.Provider>
      </WorkflowNodeContext.Provider>
    </NodeRenderSceneContext.Provider>
  );
}

function useWorkflowNode(node: FlowNodeEntity) {
  const [workflowNode, setWorkflowNode] = useState<WorkflowNode>(
    new WorkflowNode(node),
  );

  // Monitor the underlying instance data changes and update the business layer instance
  useEffect(() => {
    const updateWorkflowNode = () => {
      startTransition(() => {
        const newWorkflowNode = new WorkflowNode(node);
        setWorkflowNode(newWorkflowNode);
      });
    };

    const dataChangeDisposer = node
      .getData(FlowNodeFormData)
      .onDataChange(() => updateWorkflowNode());

    const initialDisposer = node
      .getData(FlowNodeFormData)
      .formModel.onInitialized(() => updateWorkflowNode());

    const errorDisposer = node
      .getData<FlowNodeErrorData>(FlowNodeErrorData)
      .onDataChange(() => updateWorkflowNode());

    return () => {
      dataChangeDisposer?.dispose();
      initialDisposer?.dispose();
      errorDisposer?.dispose();
    };
  }, [node]);

  return workflowNode;
}
