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
 
import { useEffect, useRef } from 'react';

import { type GetWorkFlowProcessData } from '@coze-arch/idl/workflow_api';
import { useService } from '@flowgram-adapter/free-layout-editor';

import { TestRunState } from '../services/workflow-run-service';
import { WorkflowRunService } from '../services';
import { useTestRunFlow } from '../components/test-run/hooks/use-test-run-flow';
import { useExecStateEntity } from './use-exec-state-entity';

export interface TestRunInstanceAction {
  /* 触发全流程 testrun */
  handleTestRun: () => Promise<void>;
  cancelTestRun: () => Promise<void>;
  pauseTestRun: () => void;
  continueTestRun: () => void;

  getTestRunHistory: (config: {
    /** 是否展示节点结果 */
    showNodeResults?: boolean;
    /** 指定执行 ID, 若不填, 则展示最近一次运行结果 */
    executeId?: string;
  }) => Promise<GetWorkFlowProcessData>;
}

export interface TestRunInstanceState {
  /* 是否执行中 */
  isExecuting: boolean;
  /* 是否执行成功 */
  isSucceed: boolean;
  /* 是否执行失败 */
  isFailed: boolean;
  /* 是否取消执行 */
  isCanceled: boolean;
  /* 是否暂停 */
  isPaused: boolean;
  /* 是否运行结束 */
  isEnd: boolean;
}

export interface TestRunInstanceCallback {
  /** testRun 执行前回调 */
  onBeforeTestRun?: () => void;
  /** testRun 开始执行回调 */
  onTestRunStart?: (executeId: string, isSingleMode?: boolean) => void;
  /** testRun 取消回调 */
  onTestRunCanceled?: (executeId: string) => void;
  /** testRun 失败回调 */
  onTestRunFailed?: (executeId: string) => void;
  /** testRun 成功回调 */
  onTestRunSucceed?: (executeId: string) => void;
  /** testRun 结束回调 */
  onTestRunEnd?: (testRunState: TestRunState, executeId: string) => void;
}

export type TestRunInstance = TestRunInstanceAction & TestRunInstanceState;

export const useTestRun = (props?: {
  callbacks?: TestRunInstanceCallback;
}): TestRunInstance => {
  const { callbacks = {} } = props || {};
  const {
    onBeforeTestRun,
    onTestRunStart,
    onTestRunEnd,
    onTestRunFailed,
    onTestRunCanceled,
    onTestRunSucceed,
  } = callbacks;

  const runService = useService<WorkflowRunService>(WorkflowRunService);

  const {
    config: { executeId, isSingleMode },
  } = useExecStateEntity();

  const isSingleModeRef = useRef(isSingleMode);
  isSingleModeRef.current = isSingleMode;

  const { onTestRunStateChange, testRunState } = runService;

  const { testRunFlow } = useTestRunFlow();

  const testRunInstance: TestRunInstance = {
    handleTestRun: async () => {
      onBeforeTestRun?.();
      await testRunFlow();
    },
    cancelTestRun: runService.cancelTestRun,
    pauseTestRun: () => runService.pauseTestRun(),
    continueTestRun: () => runService.continueTestRun(),
    getTestRunHistory: config => runService.getProcessResult(config),

    isExecuting: testRunState === TestRunState.Executing,
    isSucceed: testRunState === TestRunState.Succeed,
    isFailed: testRunState === TestRunState.Failed,
    isCanceled: testRunState === TestRunState.Canceled,
    isPaused: testRunState === TestRunState.Paused,
    isEnd: [
      TestRunState.Succeed,
      TestRunState.Failed,
      TestRunState.Canceled,
    ].includes(testRunState),
  };

  useEffect(() => {
    // 处理testRun回调
    const dispose = onTestRunStateChange(({ prevState, curState }) => {
      if (
        [
          TestRunState.Succeed,
          TestRunState.Failed,
          TestRunState.Canceled,
        ].includes(curState)
      ) {
        onTestRunEnd?.(curState, executeId);

        switch (curState) {
          case TestRunState.Failed:
            onTestRunFailed?.(executeId);
            break;
          case TestRunState.Succeed:
            onTestRunSucceed?.(executeId);
            break;
          case TestRunState.Canceled:
            onTestRunCanceled?.(executeId);
            break;
          default:
            break;
        }
      }

      if (
        prevState === TestRunState.Idle &&
        curState === TestRunState.Executing
      ) {
        onTestRunStart?.(executeId, isSingleModeRef.current);
      }
    });

    return () => dispose.dispose();
  }, [callbacks, executeId]);

  return testRunInstance;
};
