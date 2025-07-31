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

import React, { useLayoutEffect, useMemo, useState } from 'react';

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type NodeResult } from '@coze-workflow/base/api';

import { type WorkflowLinkLogData } from '../../types';
import { useMarkdownModal } from '../../features/log';
import { LogDetailPagination } from './pagination';
import { type LogImages as LogImagesType } from './log-images';
import { LogFields } from './log-fields';
import useGetCurrentResult from './hooks/use-get-current-result';

import css from './log-detail.module.less';

interface LogDetailProps {
  result: NodeResult;
  node?: FlowNodeEntity;
  paginationFixedCount?: number;

  LogImages: LogImagesType;

  spaceId: string;
  workflowId: string;
  onOpenWorkflowLink?: (data: WorkflowLinkLogData) => void;
}

export const LogDetail: React.FC<LogDetailProps> = ({
  result,
  node,
  paginationFixedCount,

  LogImages,

  spaceId,
  workflowId,
  onOpenWorkflowLink,
}) => {
  const { isBatch, nodeId } = result;
  /** Start from 0 */
  const [paging, setPaging] = useState(0);
  /** Just look at the error. */
  const [onlyShowError, setOnlyShowError] = useState(false);

  const { current, batchData } = useGetCurrentResult({
    result,
    paging,
    spaceId,
    workflowId,
  });

  const echoCurrent = useMemo(() => {
    if (!isBatch || !onlyShowError) {
      return current;
    }
    return current?.errorInfo ? current : undefined;
  }, [isBatch, onlyShowError, current]);

  const { modal, open } = useMarkdownModal();

  // When the paging data changes, re-select the first item
  useLayoutEffect(() => {
    setPaging(0);
  }, [batchData]);

  return (
    <div className={css['log-detail']}>
      {/* paging */}
      {isBatch ? (
        <LogDetailPagination
          paging={paging}
          data={batchData}
          fixedCount={paginationFixedCount}
          onlyShowError={onlyShowError}
          onChange={setPaging}
          onShowErrorChange={setOnlyShowError}
        />
      ) : null}
      {echoCurrent ? (
        <LogImages testRunResult={echoCurrent} nodeId={nodeId} />
      ) : null}
      <LogFields
        data={echoCurrent}
        node={node}
        onPreview={open}
        onOpenWorkflowLink={onOpenWorkflowLink}
      />
      {modal}
    </div>
  );
};
