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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable complexity */
/**
 * Adapt coze graph 2.0 node test form
 */

import { useState, useEffect, useRef, useCallback } from 'react';

import cls from 'classnames';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { TestFormFieldName } from '@coze-workflow/test-run-next';
import { ResizablePanel } from '@coze-workflow/test-run';
import { useValidationService } from '@coze-workflow/base/services';
import { NodeExeStatus } from '@coze-workflow/base/api';
import { CONVERSATION_NAME } from '@coze-workflow/base';
import {
  PremiumPaywallBanner,
  PremiumPaywallBannerScene,
} from '@coze-studio/premium-components-adapter';
import { IntelligenceType } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { IconCozCross } from '@coze-arch/coze-design/icons';
import { IconButton, Toast, Typography } from '@coze-arch/coze-design';

import {
  useExecStateEntity,
  useOpenTraceListPanel,
  useTestFormState,
} from '@/hooks';
import useLogView from '@/components/test-run/hooks/use-log-view';
import { useChatflowInfo } from '@/components/test-run/hooks/use-chatflow-info';

import { stringifyValue } from '../utils/stringify-value';
import { TestFormV3 } from '../test-form-v3';
import { QuestionForm } from '../question-form';
import { InputForm } from '../input-form';
import { useTestRunStatus } from '../hooks/use-test-run-status';
import { ExecuteState } from '../execute-result/execute-result-side-sheet/components/execute-state';
import { FieldName } from '../constants';
import { TestRunState } from '../../../services/workflow-run-service';
import { WorkflowRunService } from '../../../services';
import RunningPanel from './running-panel';
import { ResultLog } from './result-log';
import { TestRunNodeButton } from './footer';

import styles from './test-node-form.module.less';

interface TestNodeFormProps {
  node: FlowNodeEntity;
}

interface TestNodeFormBaseProps {
  node: FlowNodeEntity;
  onClose: () => void;
}

export const useShowResultNotice = (node: FlowNodeEntity) => {
  const execEntity = useExecStateEntity();
  const result = execEntity.getNodeExecResult(node.id);
  const testFormState = useTestFormState();
  const {
    config: { testNodeFormVisible },
  } = testFormState;
  const hasResult =
    !!result?.nodeStatus &&
    [NodeExeStatus.Success, NodeExeStatus.Fail].includes(result.nodeStatus);

  return hasResult && execEntity.config.isSingleMode && !testNodeFormVisible;
};

const TestNodeResultNotice: React.FC<{ node: FlowNodeEntity }> = ({ node }) => {
  const testFormState = useTestFormState();
  const execEntity = useExecStateEntity();

  const [transition, setTransition] = useState(false);

  useEffect(() => {
    setTimeout(() => setTransition(true));
  }, []);

  return (
    <div
      className={cls(styles['test-node-result-notice'], {
        [styles['transition-show']]: transition,
      })}
      onClick={() => {
        testFormState.showTestNodeForm();
      }}
    >
      <div className={styles['result-notice-bg']}>
        <Typography.Text className="coz-fg-hglt" size="small">
          {I18n.t('workflow_running_results_banner')}
        </Typography.Text>
        <IconButton
          icon={<IconCozCross />}
          color="secondary"
          onClick={e => {
            e.stopPropagation();
            execEntity.clearNodeResult();
          }}
        />
      </div>
    </div>
  );
};

const TestNodeFormCore: React.FC<TestNodeFormBaseProps> = ({
  node,
  onClose,
}) => {
  const formApiRef = useRef<any>(null);
  const validationService = useValidationService();
  const execEntity = useExecStateEntity();
  const runService = useService<WorkflowRunService>(WorkflowRunService);

  const panelRef = useRef<any>(null);
  const result = execEntity.getNodeExecResult(node.id);
  const { sessionInfo, conversationInfo } = useChatflowInfo();
  const { running } = useTestRunStatus(node.id);

  const { logNodeRef, logView } = useLogView();

  const showResult =
    !!result?.nodeStatus &&
    execEntity.config.isSingleMode &&
    [NodeExeStatus.Success, NodeExeStatus.Fail].includes(result.nodeStatus);

  const testRunNodeV3 = async () => {
    const { hasError } = await validationService.validateNode(
      node as FlowNodeEntity,
    );
    if (hasError) {
      Toast.error({
        content: I18n.t('workflow_detail_toast_validation_failed'),
        showClose: false,
      });
      panelRef.current?.minimize();
      return;
    }
    if (!formApiRef.current) {
      return;
    }
    panelRef.current?.maximize();
    const { empty, validate, values } = await formApiRef.current.submit();
    if (!validate) {
      Toast.error(I18n.t('workflow_testrun_form_vailate_error_toast'));
      return;
    }
    let input: Record<string, string> | undefined;
    let setting: Record<string, string> | undefined;
    let batch: Record<string, string> | undefined;
    let related: Record<string, string> | undefined;
    let botId: string | undefined;
    if (!empty) {
      input = stringifyValue(values?.[FieldName.Node]?.[FieldName.Input], [
        'role_information',
      ]);
      batch = stringifyValue(values?.[FieldName.Node]?.[FieldName.Batch]);
      setting = stringifyValue(values?.[FieldName.Node]?.[FieldName.Setting]);
      related = values?.[TestFormFieldName.Related];
      botId = (related?.[FieldName.Bot] as any)?.id || related?.[FieldName.Bot];
      const conversation = related?.[TestFormFieldName.Conversation];
      /** Although the session selector has a value, it is not used. Historical design issues, expect to be optimized later */
      if (conversation && conversationInfo?.label) {
        input = {
          ...input,
          [CONVERSATION_NAME]: conversationInfo?.label,
        };
      }
    }
    await runService.testRunOneNode({
      input,
      batch,
      setting,
      botId,
      nodeId: node.id,
      useProject: sessionInfo?.type === IntelligenceType.Project,
    });
  };

  const handleSubmit = async () => {
    // The result of closing a practice run first
    runService.clearTestRun();
    await testRunNodeV3();
  };

  const { open } = useOpenTraceListPanel();

  const handleOpenTraceBottomSheet = useCallback(() => {
    // will support soon
    if (IS_OPEN_SOURCE) {
      return;
    }
    open();
  }, [open]);

  const headerRender = () => (
    <div className={'w-full flex items-center justify-between mr-[4px]'}>
      <span className={'font-medium'}>
        {I18n.t('workflow_detail_title_testrun')}
      </span>

      {!running && (
        <ExecuteState
          onClick={handleOpenTraceBottomSheet}
          hiddenStateText
          extra={
            // will support soon
            !IS_OPEN_SOURCE && (
              <span className={'font-medium cursor-pointer'}>
                {I18n.t('workflow_testset_view_log')}
              </span>
            )
          }
        />
      )}
    </div>
  );

  return (
    <ResizablePanel
      animation={'translateY'}
      className={cls('test-node-form-panel', styles['test-node-form-panel'])}
      ref={panelRef}
      innerScrollRef={logNodeRef}
      header={headerRender()}
      headerExtra={
        <PremiumPaywallBanner scene={PremiumPaywallBannerScene.Token} />
      }
      footer={<TestRunNodeButton node={node} onClick={() => handleSubmit()} />}
      onClose={onClose}
    >
      <div className={styles['test-node-form-content']}>
        <div
          className={cls('w-full h-full', {
            [styles['test-form-content-absolute']]: running,
          })}
        >
          <TestFormV3 node={node} onMounted={v => (formApiRef.current = v)} />
          {showResult ? (
            <ResultLog result={result} node={node} extra={logView} />
          ) : null}
        </div>

        {running ? <RunningPanel /> : null}
      </div>
      <QuestionForm />
      <InputForm />
    </ResizablePanel>
  );
};

const TestNodeForm: React.FC<TestNodeFormProps> = ({ node }) => {
  const testFormState = useTestFormState();
  const runService = useService<WorkflowRunService>(WorkflowRunService);
  const {
    config: { testNodeFormVisible },
  } = testFormState;

  const handleClose = useCallback(() => {
    testFormState.closeTestNodeForm();
    if (
      runService.testRunState === TestRunState.Executing ||
      runService.testRunState === TestRunState.Paused
    ) {
      runService.cancelTestRun();
    }
  }, [testFormState, runService]);

  if (!testNodeFormVisible) {
    return null;
  }

  return <TestNodeFormCore node={node} onClose={handleClose} />;
};

export { TestNodeForm, TestNodeResultNotice };
