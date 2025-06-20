import React from 'react';

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { FormBaseGroupCollapse } from '@coze-workflow/test-run-next';
import { LogDetail } from '@coze-workflow/test-run';
import { type NodeResult } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';

import { useOpenWorkflow } from '@/test-run-kit';
import { useGlobalState } from '@/hooks';

import { ImgLogV2 } from '../img-log-v2';

export const ResultLog: React.FC<{
  result: NodeResult;
  node?: FlowNodeEntity;
  extra?: React.ReactNode;
}> = ({ result, node, extra }) => {
  const globalState = useGlobalState();
  const { open: openWorkflow } = useOpenWorkflow();
  return (
    <>
      <FormBaseGroupCollapse label={I18n.t('workflow_running_results')}>
        <LogDetail
          spaceId={globalState.spaceId}
          workflowId={globalState.workflowId}
          result={result}
          paginationFixedCount={5}
          LogImages={ImgLogV2}
          node={node}
          onOpenWorkflowLink={openWorkflow}
        />

        {extra}
      </FormBaseGroupCollapse>
      <div className="pb-2"></div>
    </>
  );
};
