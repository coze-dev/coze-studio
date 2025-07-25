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
import React, { useCallback, useMemo } from 'react';

import cls from 'classnames';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { LogDetail, type WorkflowLinkLogData } from '@coze-workflow/test-run';

import { ExecuteLogId } from '../execute-log-id';
import { ImgLogV2 } from '../../img-log-v2';
import { useExecStateEntity, useGlobalState } from '../../../../hooks';
// import { LogDetail } from './log-detail';

import styles from './index.module.less';

type ExecuteResultPanelProps = {
  node: FlowNodeEntity;
  /** 打开子工作流跳转链接 */
  onOpenWorkflowLink?: (data: WorkflowLinkLogData) => void;
} & React.HTMLAttributes<HTMLDivElement>;

const ExecuteResultPanel: React.FC<ExecuteResultPanelProps> = ({
  node,
  className,
  onOpenWorkflowLink,
  ...props
}) => {
  const entity = useExecStateEntity();
  const id = useMemo(() => node.id, [node]);
  const executeResult = entity.getNodeExecResult(id);
  const globalState = useGlobalState();

  /**
   * hover 事件统一走的是 mousemove 冒泡，由于 hover node 的算法没有考虑 node 为多边形的情况
   * 会在浮层中的 move 误判为 playground or line 会触发圈选逻辑或者高亮线条，所以阻止 mousemove 冒泡
   * mousedown 也必须阻止冒泡，否则会判定圈选
   * drag 事件统一走的 mousemove 捕获，所以拖拽不受影响
   */
  const handleStepPropagation = useCallback<
    React.MouseEventHandler<HTMLDivElement>
  >(e => {
    e.stopPropagation();
  }, []);

  const hasError = executeResult?.errorLevel === 'Error';

  return (
    <div
      className={cls(styles['flow-test-run-result-panel'], className)}
      onMouseDown={handleStepPropagation}
      onMouseMove={handleStepPropagation}
      {...props}
    >
      {executeResult ? (
        <LogDetail
          spaceId={globalState.spaceId}
          workflowId={globalState.workflowId}
          result={executeResult}
          paginationFixedCount={5}
          LogImages={ImgLogV2}
          onOpenWorkflowLink={onOpenWorkflowLink}
          node={node}
        />
      ) : null}
      {hasError ? (
        <div className="mt-4">
          <ExecuteLogId />
        </div>
      ) : null}
    </div>
  );
};

export { ExecuteResultPanel };
