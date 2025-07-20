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
  /** 流程执行 ID */
  executeId?:
    | {
        /** 获取当前流程执行 ID */
        type: 'workflow';
        value: string;
      }
    | {
        /**
         * 获取持久化流程执行 ID
         * 解决商店配置流程案例需要持久化的问题
         */
        type: 'store';
        value: string;
        sourceWfId: string;
      };
  /** 当配置 executeId 时, 展示运行结果 */
  showExecuteResult?: boolean;
  /** 当配置 executeId 时, 将历史输入设置为试运行默认输入 */
  enableInitTestRunInput?: boolean;
  /** 是否禁止单节点试运行 */
  disabledSingleNodeTest?: boolean;
  /** 运行成功事件 */
  onTestRunSucceed?: (executeId: string) => void;
  /** 禁用试运行和调试工具 */
  disableTraceAndTestRun?: boolean;

  disableGetTestCase?: boolean;
}

export interface UseWorkflowPlaygroundProps {
  /** 来源 */
  from?: WorkflowPlaygroundProps['from'];
  onTriggerTestRun?: () => void;
}

/**
 * 用于预览和运行流程
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

  /** 流程组件 */
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
          // 单节点调试，不记录历史记录，所以不要清除
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

          // 预设了执行 ID, 记为一次试运行
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
        // 非强制更新时, 对比 workflowId 一致性, 如果一致则不更新
        if (!force && val?.workflowId === config?.workflowId) {
          return val;
        }
        return config;
      });
    },
    /** 流程组件实例 */
    workflowRef,
    /** 是否是运行中状态 */
    isRunning,
    /** 运行结果是否展示 */
    testResultVisible,
    /** 触发试运行 */
    triggerTestRun: () => {
      workflowRef.current?.triggerTestRun();
    },
    /** 取消试运行 */
    cancelTestRun: () => {
      workflowRef.current?.cancelTestRun();
    },
    /** 展示运行结果 */
    showTestRunResult: () => {
      workflowRef.current?.showTestRunResult(lastTestRunResultRef.current);
    },
    /** 隐藏试运行结果 */
    hideTestRunResult: () => {
      workflowRef.current?.hideTestRunResult();
    },
    /** 流程组件 */
    workflowComp,
    /** 试运行组件 */
    testRunBtnsComp,
  };
}
