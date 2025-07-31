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

import { type IFormSchema } from '@coze-workflow/test-run-next';
import { useTestFormService } from '@coze-workflow/test-run';

import { useGlobalState, useTestRunReporterService } from '@/hooks';

import { getNodeExecuteHistoryInput } from '../utils';

export const useFormDefaultValues = () => {
  const testFormService = useTestFormService();
  const globalState = useGlobalState();
  const reporter = useTestRunReporterService();
  const getDefaultValues = async (schema: IFormSchema) => {
    if (!schema) {
      return;
    }
    const nodeId = schema['x-node-id'] || '';
    const nodeType = schema['x-node-type'] || '';

    // Highest merit: The last value the user filled in
    const cacheData = testFormService.getCacheValues(nodeId);
    if (cacheData) {
      reporter.formGenDataOrigin({ gen_data_origin: 'cache' });
      return cacheData;
    }

    const historyValues = await getNodeExecuteHistoryInput({
      workflowId: globalState.workflowId,
      spaceId: globalState.spaceId,
      nodeId,
      nodeType,
    });
    if (historyValues) {
      reporter.formGenDataOrigin({ gen_data_origin: 'history' });
      return historyValues;
    }
  };

  return { getDefaultValues };
};
