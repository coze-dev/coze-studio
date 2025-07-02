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

  // 监听底层实例数据变化 并更新业务层实例
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
