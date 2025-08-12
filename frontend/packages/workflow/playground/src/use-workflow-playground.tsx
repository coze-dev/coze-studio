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

import { useRef, useState, useMemo, useEffect } from 'react';

import { isBoolean } from 'lodash-es';
import { PUBLIC_SPACE_ID } from '@coze-workflow/base/constants';
import {
  type GetWorkFlowProcessData,
  type GetWorkflowProcessRequest,
  OperateType,
  workflowApi,
} from '@coze-workflow/base/api';
import { reporter } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';
import { Button, Space } from '@coze-arch/coze-design';

import { WorkflowPlayground } from './workflow-playground';
import {
  type WorkflowPlaygroundRef,
  type WorkflowPlaygroundProps,
} from './typing';
import { type TestFormDefaultValue } from './components/test-run/types';

export interface WorkflowPlaygroundInitConfig {
  spaceId?: string;
  workflowId?: string;
  commitId?: string;
  /** process execution ID */
  executeId?:
    | {
        /** Get the current process execution ID */
        type: 'workflow';
        value: string;
      }
    | {
        /**
         * Get the persistent process execution ID
         * Solve the problem that the store configuration process case needs to be persisted
         */
        type: 'store';
        value: string;
        sourceWfId: string;
      };
  /** When configuring executeId, display the running results */
  showExecuteResult?: boolean;
  /** Set history input to practice run default when configuring executeId */
  enableInitTestRunInput?: boolean;
  /** Whether to disable single node practice running */
  disabledSingleNodeTest?: boolean;
  /** run success event */
  onTestRunSucceed?: (executeId: string) => void;
  /** Disable practice running and debugging tools */
  disableTraceAndTestRun?: boolean;

  disableGetTestCase?: boolean;
}

export interface UseWorkflowPlaygroundProps {
  /** source */
  from?: WorkflowPlaygroundProps['from'];
  onTriggerTestRun?: () => void;
}

/**
 * For previewing and running processes
 */
export function useWorkflowPlayground(props?: UseWorkflowPlaygroundProps) {
  const workflowRef = useRef<WorkflowPlaygroundRef>(null);
  const propsRef = useRef(props);
  const [initConfig, setInitConfig] = useState<WorkflowPlaygroundInitConfig>();
  const [isRunning, setIsRunning] = useState(false);
  const [defaultInput, setDefaultInput] = useState<TestFormDefaultValue[]>([]);
  const [testRunCount, setTestRunCount] = useState(0);
  const lastTestRunResultRef = useRef<GetWorkFlowProcessData>();

  const [testResultVisible, setTestResultVisible] = useState(false);

  const isNodeLogNeedAsync = true;

  useEffect(() => {
    propsRef.current = props;
  }, [props]);

  /** Process Component */
  const workflowComp = useMemo(() => {
    if (!initConfig?.workflowId) {
      return null;
    }

    const { spaceId, workflowId, commitId, onTestRunSucceed } = initConfig;

    return (
      <WorkflowPlayground
        ref={workflowRef}
        from={propsRef.current?.from}
        readonly
        spaceId={spaceId}
        workflowId={workflowId}
        commitId={commitId}
        commitOptType={OperateType.PublishOperate}
        defaultResultCollapseMode="all"
        disabledSingleNodeTest={initConfig.disabledSingleNodeTest}
        disableGetTestCase={initConfig.disableGetTestCase}
        renderHeader={() => null}
        onTestRunStart={(_, isSingleMode) => {
          // Single-node debugging, no history is recorded, so do not clear
          if (isBoolean(isSingleMode) && !isSingleMode) {
            lastTestRunResultRef.current = undefined;
          }
          setIsRunning(true);
        }}
        onTestRunEnd={() => {
          setIsRunning(false);
          setTestRunCount(val => val + 1);
        }}
        onTestRunResultVisibleChange={setTestResultVisible}
        testFormDefaultValues={defaultInput}
        onTestRunSucceed={onTestRunSucceed}
        onInit={async () => {
          if (!initConfig.executeId) {
            return;
          }

          const getTestRunResult = async () => {
            if (!initConfig?.workflowId || !initConfig?.executeId) {
              return;
            }
            try {
              let result: GetWorkFlowProcessData | undefined;
              if (initConfig.executeId.type === 'store') {
                const resp = await workflowApi.GetStoreTestRunHistory(
                  {
                    source_workflow_id: initConfig.executeId.sourceWfId,
                    execute_id: initConfig.executeId.value,
                  },
                  {
                    __disableErrorToast: true,
                  },
                );
                result = resp.data;
              } else {
                const params: GetWorkflowProcessRequest = {
                  workflow_id: initConfig.workflowId,
                  space_id: initConfig.spaceId || PUBLIC_SPACE_ID,
                  execute_id: initConfig.executeId.value,
                };

                if (isNodeLogNeedAsync) {
                  params.need_async = isNodeLogNeedAsync;
                }

                const resp = await workflowApi.GetWorkFlowProcess(params, {
                  __disableErrorToast: true,
                });

                result = resp.data;
              }
              return result;
            } catch (e) {
              reporter.error({
                message: e.message,
                error: e,
              });
            }
          };

          const testRunResult = await getTestRunResult();

          if (!testRunResult?.executeId || testRunResult.executeId === '0') {
            return;
          }

          // Default execution ID, recorded as a practice run
          setTestRunCount(val => val + 1);

          if (initConfig.enableInitTestRunInput) {
            const startNodeInfo = (testRunResult.nodeResults || []).find(
              item => item.NodeType === 'Start',
            );
            if (startNodeInfo) {
              const inputVal = typeSafeJSONParse(
                startNodeInfo.input || '{}',
              ) as TestFormDefaultValue['input'];
              setDefaultInput([{ input: inputVal }]);
            }
          }
          if (initConfig.showExecuteResult) {
            workflowRef.current?.showTestRunResult(testRunResult);
            lastTestRunResultRef.current = testRunResult;
          }
        }}
        disableTraceAndTestRun={initConfig?.disableTraceAndTestRun}
      />
    );
  }, [initConfig, defaultInput, propsRef, isNodeLogNeedAsync]);

  const testRunBtnsComp = useMemo(() => {
    if (!workflowComp) {
      return null;
    }

    return (
      <Space>
        {testRunCount > 0 ? (
          <Button
            color="highlight"
            disabled={isRunning}
            onClick={() => {
              if (testResultVisible) {
                workflowRef.current?.hideTestRunResult();
              } else {
                workflowRef.current?.showTestRunResult(
                  lastTestRunResultRef.current,
                );
              }
            }}
          >
            {testResultVisible
              ? I18n.t('workflow_detail_title_lastrun_hide')
              : I18n.t('workflow_detail_title_lastrun_display')}
          </Button>
        ) : null}
        {isRunning ? (
          <Button
            color="highlight"
            onClick={() => workflowRef.current?.cancelTestRun()}
          >
            {I18n.t('workflow_detail_title_testrun_cancel')}
          </Button>
        ) : null}
        <Button
          color="highlight"
          loading={isRunning}
          onClick={() => {
            propsRef.current?.onTriggerTestRun?.();
            workflowRef.current?.triggerTestRun();
          }}
        >
          {I18n.t('workflow_detail_title_testrun')}
        </Button>
      </Space>
    );
  }, [workflowComp, testRunCount, isRunning, testResultVisible]);

  return {
    init: (config?: WorkflowPlaygroundInitConfig, force?: boolean) => {
      setInitConfig(val => {
        // When non-forced update, compare workflowId consistency, if consistent, do not update
        if (!force && val?.workflowId === config?.workflowId) {
          return val;
        }
        return config;
      });
    },
    /** Process component instance */
    workflowRef,
    /** Is it running? */
    isRunning,
    /** Is the running result displayed? */
    testResultVisible,
    /** Trigger practice run */
    triggerTestRun: () => {
      workflowRef.current?.triggerTestRun();
    },
    /** Cancel practice run */
    cancelTestRun: () => {
      workflowRef.current?.cancelTestRun();
    },
    /** Show the running results */
    showTestRunResult: () => {
      workflowRef.current?.showTestRunResult(lastTestRunResultRef.current);
    },
    /** Hide practice run results */
    hideTestRunResult: () => {
      workflowRef.current?.hideTestRunResult();
    },
    /** Process Component */
    workflowComp,
    /** Practice running components */
    testRunBtnsComp,
  };
}
