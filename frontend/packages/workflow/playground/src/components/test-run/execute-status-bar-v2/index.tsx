/**
 * 适配 coze graph 2.0 的节点状态栏
 */
import React from 'react';

import { WorkflowExecStatus, NodeExeStatus } from '@coze-workflow/base';
import { getNodeError } from '@flowgram-adapter/free-layout-editor';
import type { FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import { useExecStateEntity, useGlobalState } from '../../../hooks';
import { ExecuteStatusBarContent } from './content';

interface ExecuteStatusBarV2Props {
  node: FlowNodeEntity;
}

const ExecuteStatusBarV2: React.FC<ExecuteStatusBarV2Props> = props => {
  const { node } = props;

  const execEntity = useExecStateEntity();
  const globalState = useGlobalState();

  // workflow 相关
  const { viewStatus } = globalState;
  const executeNodeResult = execEntity.getNodeExecResult(node.id);

  // 节点相关
  const { nodeStatus } = executeNodeResult || {};
  // 节点 4 个状态
  const isNodeWaiting = nodeStatus === NodeExeStatus.Waiting;
  // 是否展示这个组件的判断。
  // 当 workflow 在运行或者运行结束 并且 存在运行结果 并且 节点不是在等待中
  const showStatusBar =
    (viewStatus === WorkflowExecStatus.EXECUTING ||
      viewStatus === WorkflowExecStatus.DONE) &&
    Boolean(executeNodeResult) &&
    !isNodeWaiting;

  const isInvalidNode = getNodeError(node);
  /**
   * 1. 无效节点不显示 status bar
   * 2. 不符合显示条件时不显示 status bar
   */
  if (isInvalidNode || !showStatusBar) {
    return null;
  }

  return <ExecuteStatusBarContent {...props} />;
};

export { ExecuteStatusBarV2 };
