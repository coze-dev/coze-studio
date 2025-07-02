import 'reflect-metadata';
import React, { useRef, useState } from 'react';

import { WorkflowPlayground } from '@coze-workflow/playground/workflow-playground';
import {
  type AddNodeRef,
  type WorkflowPlaygroundRef,
} from '@coze-workflow/playground/typing';

import { usePageParams } from './hooks/use-page-params';
import { useNavigateBack } from './hooks';

// 添加节点放在工具栏了，原来侧边栏不需要了
const EmptySidebar = React.forwardRef<AddNodeRef, unknown>(
  (_props, _addNodeRef) => null,
);

export function WorkflowPage(): React.ReactNode {
  const workflowPlaygroundRef = useRef<WorkflowPlaygroundRef>(null);
  const {
    spaceId,
    workflowId,
    version,
    setVersion,
    from,
    optType,
    nodeId,
    executeId,
    subExecuteId,
  } = usePageParams();

  const [initOnce, setInitOnce] = useState(false);
  const { navigateBack } = useNavigateBack();

  /** 是否只读模式, 来源于流程探索模块 */
  const readonly = from === 'explore';

  if (!workflowId || !spaceId) {
    return null;
  }

  return (
    <>
      <WorkflowPlayground
        ref={workflowPlaygroundRef}
        sidebar={EmptySidebar}
        workflowId={workflowId}
        spaceId={spaceId}
        commitId={setVersion ? undefined : version}
        commitOptType={setVersion ? undefined : optType}
        readonly={readonly}
        executeId={executeId}
        subExecuteId={subExecuteId}
        onInit={_workflowState => {
          if (setVersion && version) {
            workflowPlaygroundRef.current?.resetToHistory({
              commitId: version,
              optType,
            });
          }

          // onInit可能被多次调用 这里只需要执行一次
          if (!initOnce) {
            // 读取链接上的node_id参数 滚动到对应节点
            if (nodeId) {
              workflowPlaygroundRef.current?.scrollToNode(nodeId);
            }

            // 读取execute_id 展示对应执行结果
            if (executeId) {
              workflowPlaygroundRef.current?.showTestRunResult(
                executeId,
                subExecuteId,
              );
            }

            setInitOnce(true);
          }
        }}
        from={from}
        onBackClick={workflowState => {
          navigateBack(workflowState, 'exit');
        }}
        onPublish={workflowState => {
          navigateBack(workflowState, 'publish');
        }}
      />
    </>
  );
}
