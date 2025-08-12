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
