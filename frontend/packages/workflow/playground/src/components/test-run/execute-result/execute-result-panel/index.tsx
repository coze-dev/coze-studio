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
  /** Open sub-workflow jump link */
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
   * The hover event uniformly goes through mousemove bubbling, because the hover node algorithm does not consider the case that the node is a polygon
   * The move in the floating layer will be misjudged as playground or line, which will trigger the circling logic or highlight the line, so prevent mousemove from bubbling.
   * Mousedown must also prevent bubbling, otherwise it will determine the circling
   * Drag events go mousemove capture uniformly, so drag is not affected
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
