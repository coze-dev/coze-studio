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

import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { useService } from '@flowgram-adapter/free-layout-editor';

import { useInnerSideSheetStoreShallow } from '@/components/workflow-inner-side-sheet';

import { useTestRunStatus } from '../hooks/use-test-run-status';
import {
  WorkflowRunService,
  WorkflowValidationService,
} from '../../../services';
import { useBizIDEState } from '../../../hooks/use-biz-ide-state';
import { useTestFormSchema } from './use-test-form-schema';

export const useTestRunNode = node => {
  const runService = useService<WorkflowRunService>(WorkflowRunService);

  const { generate } = useTestFormSchema(node);
  const validationService = useService<WorkflowValidationService>(
    WorkflowValidationService,
  );
  const { setLoading } = useTestRunStatus(node.id);

  const { closeBizIDE } = useBizIDEState();

  const { activeId, closeSideSheet } = useInnerSideSheetStoreShallow();
  const testRunNode = async () => {
    // Try closing the open side window. The closeBizIDE below cannot be deleted because closeBizIDE is asynchronous.
    closeSideSheet(activeId as string);

    setLoading(true);
    try {
      sendTeaEvent(EVENT_NAMES.workflow_test_node, {
        type: node.flowNodeType,
      });
      /** After the code ide is closed, the test run can be performed */
      if (!(await closeBizIDE())) {
        return;
      }
      // The result of closing a practice run first
      runService.clearTestRun();
      const { hasError } = await validationService.validateNode(node);
      if (hasError) {
        Toast.error({
          content: I18n.t('workflow_detail_toast_validation_failed'),
          showClose: false,
        });
        return;
      }
      const testFormSchema = await generate();
      if (!testFormSchema) {
        return;
      }
      if (!testFormSchema.fields?.length) {
        runService.testRunOneNode({ nodeId: testFormSchema.id });
        return;
      }
      runService.testFormState.openTestForm(testFormSchema);
    } finally {
      setLoading(false);
    }
  };

  return { testRunNode };
};
