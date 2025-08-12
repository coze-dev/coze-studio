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

/* eslint-disable max-lines-per-function */
/* eslint-disable @coze-arch/no-deep-relative-import */
import { useEffect, useMemo } from 'react';

import { useUpdateEffect } from 'ahooks';
import {
  WorkflowExeStatus,
  WorkflowExeHistoryStatus,
  type GetWorkFlowProcessData,
} from '@coze-workflow/base/api';
import { WorkflowExecStatus } from '@coze-workflow/base';
import { useService } from '@flowgram-adapter/free-layout-editor';

import { useSingletonInnerSideSheet } from '../../../../workflow-inner-side-sheet';
import { WorkflowRunService } from '../../../../../services';
import {
  useExecStateEntity,
  useLineService,
  useGlobalState,
} from '../../../../../hooks';
import { useHasError } from './use-has-error';

export const useResultSideSheetVisible = () => {
  const runService = useService<WorkflowRunService>(WorkflowRunService);
  const execEntity = useExecStateEntity();
  const lineService = useLineService();
  const { resultSideSheetVisible, resultSideSheetLoading, hasNodeResult } =
    execEntity;

  const { viewStatus, playgroundProps, canTestRunHistory } = useGlobalState();

  const { visible, handleOpen, handleClose } =
    useSingletonInnerSideSheet('execute-result');
  const resultVisible = useMemo(
    () => hasNodeResult || visible,
    [hasNodeResult, visible],
  );

  useEffect(() => {
    playgroundProps.onTestRunResultVisibleChange?.(resultVisible);
  }, [resultVisible, playgroundProps.onTestRunResultVisibleChange]);

  const { exeHistoryStatus } = execEntity.config;

  const hasError = useHasError();

  const getProcess = (showResult?: boolean) =>
    runService.getProcessResult({ showNodeResults: showResult });

  const openSideSheet = async () => {
    const opened = await handleOpen();
    if (!opened) {
      return false;
    }
    execEntity.openSideSheet();
    return true;
  };

  const openSideSheetAndShowResult = async () => {
    const opened = await openSideSheet();
    if (!opened) {
      return;
    }

    // 1. If there is already an error, display the error. 2. There are already results and do not pull. 3. The result cannot be obtained during operation.
    if (
      !hasError &&
      !hasNodeResult &&
      viewStatus !== WorkflowExecStatus.EXECUTING &&
      canTestRunHistory
    ) {
      execEntity.updateConfig({
        resultSideSheetLoading: true,
      });
      await runService.getProcessResult({ showNodeResults: true });
      execEntity.updateConfig({
        resultSideSheetLoading: false,
      });
    }

    lineService.validateAllLine();
  };

  const closeSideSheet = () => {
    handleClose();
    execEntity.closeSideSheet();
  };

  const closeSideSheetAndHideResult = () => {
    closeSideSheet();
    runService.clearTestRun();
    lineService.validateAllLine();
  };

  const showResult = async (config?: {
    executeId?: string;
    processResp?: GetWorkFlowProcessData;
    subExecuteId?: string;
  }) => {
    const { executeId, processResp, subExecuteId } = config ?? {};

    // There is already an error reported, no need to query the result, just open the pop-up window.
    if (hasError && !executeId && !processResp) {
      openSideSheet();
      return;
    }
    // Query results, if there is an error, open the pop-up window
    const { executeStatus } = await runService.getProcessResult({
      executeId,
      processResp,
      showNodeResults: true,
      subExecuteId,
    });
    if (executeStatus === WorkflowExeStatus.Fail) {
      openSideSheet();
    }
  };

  const hasLastResult =
    exeHistoryStatus === WorkflowExeHistoryStatus.HasHistory;

  // Keep resultSideSheetVisible and singleton popups visible
  useUpdateEffect(() => {
    if (resultSideSheetVisible) {
      handleOpen().then(opened => {
        if (!opened) {
          execEntity.openSideSheet();
        }
      });
    } else {
      handleClose().then(closed => {
        if (!closed) {
          execEntity.closeSideSheet();
        }
      });
    }
    lineService.validateAllLine();
  }, [resultSideSheetVisible]);

  return {
    openSideSheet,
    openSideSheetAndShowResult,
    closeSideSheet,
    closeSideSheetAndHideResult,

    getProcess,
    hasLastResult,

    resultSideSheetVisible: visible,
    loading: resultSideSheetLoading,
    showResult,
    resultVisible,
  };
};
