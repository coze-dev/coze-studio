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
  /** 从 0 开始 */
  const [paging, setPaging] = useState(0);
  /** 只看错误 */
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

  // 当分页数据发生变化，重新选中第一项
  useLayoutEffect(() => {
    setPaging(0);
  }, [batchData]);

  return (
    <div className={css['log-detail']}>
      {/* 分页 */}
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
