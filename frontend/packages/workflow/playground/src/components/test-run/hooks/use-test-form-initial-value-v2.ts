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

import { invert } from 'lodash-es';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';
import { FieldName, useTestFormService } from '@coze-workflow/test-run';
import { workflowApi, StandardNodeType } from '@coze-workflow/base';
import { NodeHistoryScene } from '@coze-arch/bot-api/workflow_api';

import { RelatedCaseDataService } from '@/services';
import { useGlobalState, useTestRunReporterService } from '@/hooks';
import { TestFormType } from '@/components/test-run/constants';

import {
  generateHistoryValues2InitialValue,
  generateCacheValues2InitialValue,
  generateCaseData2InitialValue,
  generateRelatedBot2InitialValue,
} from '../utils/generate-test-form-initial-value';
import { type TestFormSchema } from '../types';

export const useTestFormInitialValueV2 = () => {
  const testFormService = useTestFormService();
  const globalState = useGlobalState();
  const reporter = useTestRunReporterService();
  const workflowDocument = useService<WorkflowDocument>(WorkflowDocument);
  const relatedCaseDataService = useService<RelatedCaseDataService>(
    RelatedCaseDataService,
  );

  const isHitGlobalCachedFg = (schema: TestFormSchema) =>
    !globalState.isInIDE && schema.type === TestFormType.Default;

  const generateInitialValues = async (schema: TestFormSchema) => {
    if (!schema?.id || !schema?.fields?.length) {
      return;
    }

    // Highest merit: The last value the user filled in
    const cacheData = testFormService.getCacheValues(schema.id);
    if (cacheData) {
      generateCacheValues2InitialValue(schema.fields, cacheData);
      reporter.formGenDataOrigin({ gen_data_origin: 'cache' });
      return;
    }
    const node = workflowDocument.getAllNodes().find(n => n.id === schema.id);

    const map = invert(StandardNodeType);

    if (!node || !map[node.flowNodeType]) {
      return;
    }

    try {
      if (isHitGlobalCachedFg(schema)) {
        const defaultCaseData = relatedCaseDataService.getRelatedBotValue();
        generateRelatedBot2InitialValue(schema.fields, defaultCaseData);
      }

      const res = await workflowApi.GetNodeExecuteHistory({
        workflow_id: globalState.workflowId,
        space_id: globalState.spaceId,
        node_id: schema.id,
        node_type: map[node.flowNodeType],
        execute_id: '',
        node_history_scene: NodeHistoryScene.TestRunInput,
      });

      if (res.data?.input) {
        generateHistoryValues2InitialValue(schema.fields, res.data.input);
        reporter.formGenDataOrigin({ gen_data_origin: 'history' });
        return;
      }

      if (isHitGlobalCachedFg(schema)) {
        const defaultCaseData = relatedCaseDataService.getDefaultCaseCaches();
        if (defaultCaseData) {
          generateCaseData2InitialValue(
            schema.fields,
            defaultCaseData?.[FieldName.Node]?.[FieldName.Input],
          );
        }
      }
      // eslint-disable-next-line @coze-arch/no-empty-catch
    } catch {
      //
    }
  };

  return { generateInitialValues };
};
