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

import { useService } from '@flowgram-adapter/free-layout-editor';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';
import { useGlobalVariableServiceState } from '@coze-workflow/variable';
import { ValidateErrorType } from '@coze-workflow/base/api';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';

import { useFloatLayoutService } from '@/hooks/use-float-layout-service';
import { LayoutPanelKey } from '@/constants';
import { useInnerSideSheetStoreShallow } from '@/components/workflow-inner-side-sheet';

import { START_NODE_ID } from '../constants';
import {
  WorkflowRunService,
  WorkflowValidationService,
} from '../../../services';
import { useBizIDEState } from '../../../hooks/use-biz-ide-state';
import {
  useExecStateEntity,
  useGlobalState,
  useLineService,
  useWorkflowOperation,
} from '../../../hooks';
import { type NodeError } from '../../../entities/workflow-exec-state-entity';
import { useTestRunStatus } from './use-test-run-status';
import { useTestFormSchema } from './use-test-form-schema';

export const useTestRunFlow = () => {
  const globalState = useGlobalState();
  const { type: variableScopeType, id } = useGlobalVariableServiceState();
  const { closeBizIDE } = useBizIDEState();

  const lineService = useLineService();

  const { generate } = useTestFormSchema();

  const execEntity = useExecStateEntity();

  const operation = useWorkflowOperation();
  const floatLayoutService = useFloatLayoutService();

  const validationService = useService<WorkflowValidationService>(
    WorkflowValidationService,
  );
  const runService = useService<WorkflowRunService>(WorkflowRunService);
  const workflowDocument = useService<WorkflowDocument>(WorkflowDocument);

  const { setLoading } = useTestRunStatus(START_NODE_ID);

  const backendValidate = async () => {
    const json = await workflowDocument.toJSON();
    const validateResult = await operation.validateSchema(
      json,
      variableScopeType === 'project' ? { projectId: id } : { botId: id },
    );

    const isError = !!validateResult?.length;

    const nodeErrorMap = validateResult?.reduce(
      (errorMap: { [nodeId: string]: NodeError[] }, item) => {
        let nodeId = item.node_error?.node_id || '';

        let error: NodeError;

        if (
          item.type === ValidateErrorType.BotConcurrentPathErr ||
          item.type === ValidateErrorType.BotValidatePathErr
        ) {
          nodeId = item.path_error?.start || '';
          error = {
            nodeId: item.path_error?.start || '',
            targetNodeId: item.path_error?.end,
            errorInfo: item.message || '',
            errorType: 'line',
            errorLevel: 'error',
          };
        } else {
          error = {
            nodeId,
            errorInfo: item.message || '',
            errorType: 'node',
            errorLevel: 'error',
          };
        }

        const errors = errorMap[nodeId] || [];

        errors.push(error);
        errorMap[nodeId] = errors;

        return errorMap;
      },
      {},
    );

    return {
      isError,
      nodeErrorMap,
    };
  };

  const handleNodeError = (nodeErrorMap?: {
    [nodeId: string]: NodeError[];
  }) => {
    if (nodeErrorMap) {
      Object.keys(nodeErrorMap).forEach(nodeId => {
        const nodeError = nodeErrorMap[nodeId];
        execEntity.setNodeError(nodeId, nodeError);
      });
    }
  };

  const { activeId, closeSideSheet } = useInnerSideSheetStoreShallow();
  const testRunFlow = async () => {
    // Try closing the open side window. The closeBizIDE below cannot be deleted because closeBizIDE is asynchronous.
    closeSideSheet(activeId as string);

    sendTeaEvent(EVENT_NAMES.workflow_testrun_result_front, {
      space_id: globalState.spaceId,
      workflow_id: globalState.workflowId,
      action: 'testrun_start',
    });
    setLoading(true);
    try {
      /** After the code ide is closed, the test run can be performed */
      if (!(await closeBizIDE())) {
        sendTeaEvent(EVENT_NAMES.workflow_testrun_result_front, {
          space_id: globalState.spaceId,
          workflow_id: globalState.workflowId,
          action: 'manual_end',
        });
        return;
      }

      // The result of closing a practice run first
      runService.clearTestRun();

      /** front-end form validation */
      const { hasError, nodeErrorMap: feErrorMap } =
        await validationService.validateWorkflow();
      if (hasError) {
        sendTeaEvent(EVENT_NAMES.workflow_testrun_result_front, {
          space_id: globalState.spaceId,
          workflow_id: globalState.workflowId,
          action: 'testrun_end',
          results: 'fail',
          fail_end: 'front_end',
          errtype: 'flow_validate',
        });
        execEntity.openSideSheet();
        handleNodeError(feErrorMap);
        lineService.validateAllLine();
        return;
      }

      /** backend validation */
      const { isError: backendError, nodeErrorMap: beErrorMap } =
        await backendValidate();
      if (backendError) {
        sendTeaEvent(EVENT_NAMES.workflow_testrun_result_front, {
          space_id: globalState.spaceId,
          workflow_id: globalState.workflowId,
          action: 'testrun_end',
          results: 'fail',
          fail_end: 'server_end',
          errtype: 'flow_validate',
        });
        execEntity.openSideSheet();
        handleNodeError(beErrorMap);
        lineService.validateAllLine();
        return;
      }

      lineService.validateAllLine();

      const testFormSchema = await generate();
      if (!testFormSchema) {
        return;
      }
      execEntity.closeSideSheet();
      if (!testFormSchema.fields?.length) {
        // direct run
        runService.testRun();
        return;
      }
      runService.testFormState.openTestForm(testFormSchema);
    } finally {
      setLoading(false);
    }
  };

  const testRunFlowV2 = () => {
    runService.clearTestRun();
    floatLayoutService.open(LayoutPanelKey.TestFlowForm);
  };

  return { testRunFlow, testRunFlowV2 };
};
