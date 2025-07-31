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

import { useEffect, useState } from 'react';

import { debounce } from 'lodash-es';
import { transPricingRules } from '@coze-studio/components';
import { logger } from '@coze-arch/logger';
import { PluginDevelopApi } from '@coze-arch/bot-api';
import { useService } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowContentChangeType,
  WorkflowDocument,
} from '@flowgram-adapter/free-layout-editor';

import { useGlobalState, useLatestWorkflowJson } from '@/hooks';

type CreditsInfo = ReturnType<typeof transPricingRules>;
/**
 * Consistent with saving debounce
 */
const HIGH_DEBOUNCE_TIME = 1000;
export const usePluginCredits = (): { credits: CreditsInfo } => {
  const workflowDocument = useService<WorkflowDocument>(WorkflowDocument);
  const globalState = useGlobalState();
  const { spaceId, workflowId, loading, loadingError } = globalState;
  const [credits, setCredits] = useState<CreditsInfo>([]);
  const { getLatestWorkflowJson } = useLatestWorkflowJson();
  const debounceCheckCredits = debounce(async () => {
    const workflow = await getLatestWorkflowJson();
    logger.info(`workflow node length:${workflow?.nodes?.length}`);
    const resp = await PluginDevelopApi.GetPluginPricingRulesByWorkflowID({
      space_id: spaceId,
      workflow_id: workflowId,
    });
    setCredits(transPricingRules(resp.pricing_rules || []));
  }, HIGH_DEBOUNCE_TIME);

  useEffect(() => {
    if (!loading && !loadingError) {
      debounceCheckCredits();
    }
  }, [loading, loadingError]);
  useEffect(() => {
    const disposable = workflowDocument.onContentChange(event => {
      if (
        [
          WorkflowContentChangeType.ADD_NODE,
          WorkflowContentChangeType.DELETE_NODE,
        ].includes(event.type)
      ) {
        debounceCheckCredits();
      }
    });
    return () => disposable.dispose();
  }, []);

  return { credits };
};
