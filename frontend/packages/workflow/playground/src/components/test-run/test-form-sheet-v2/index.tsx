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

/* eslint-disable @typescript-eslint/no-explicit-any -- history code */
/**
 * Adapt coze graph 2.0 test form
 */

import { useRef } from 'react';

import cls from 'classnames';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { TestFormFieldName } from '@coze-workflow/test-run-next';
import {
  FormItemSchemaType,
  FormPanelLayout,
  TestsetEditPanel,
  TestsetManageProvider,
} from '@coze-workflow/test-run';
import { NodeExeStatus } from '@coze-workflow/base/api';
import { userStoreService } from '@coze-studio/user-store';
import {
  PremiumPaywallBanner,
  PremiumPaywallBannerScene,
} from '@coze-studio/premium-components-adapter';
import { IntelligenceType } from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';

import { type WorkflowNodeEntity } from '@/test-run-kit';
import { useValidateWorkflow } from '@/hooks/use-validate-workflow';
import {
  useExecStateEntity,
  useFloatLayoutService,
  useGlobalState,
  useTestRunReporterService,
} from '@/hooks';
import { useChatflowInfo } from '@/components/test-run/hooks/use-chatflow-info';
import { ResizableSidePanel } from '@/components/resizable-side-panel';

import { stringifyValue } from '../utils/stringify-value';
import { trySaveTestset } from '../test-form-v3/mode-form-kit';
import { TestFormV3 } from '../test-form-v3';
import { JsonEditorSemi } from '../test-form-materials/json-editor';
import { QuestionForm } from '../question-form';
import { InputForm } from '../input-form';
import { useTestsetBizCtx } from '../hooks/use-testset-biz-ctx';
import { useTestRunStatus } from '../hooks/use-test-run-status';
import useLogView from '../hooks/use-log-view';
import { useGetStartNode } from '../hooks/use-get-start-node';
import { START_NODE_ID } from '../constants';
import { TestsetBotProjectSelect } from '../chat-flow-test-form-panel/testset-bot-project-select';
import { PanelWrap } from '../../float-layout';
import { WorkflowRunService } from '../../../services';
import RunningPanel from './running-panel';
import { ResultLog } from './result-log';
import { TestFormSheetHeaderV2 } from './header';
import { TestFormSheetFooterV2 } from './footer';

import styles from './styles.module.less';

interface TestWorkflowFormPanelProps {
  node: WorkflowNodeEntity;
}

const TestFormSheetV2: React.FC<TestWorkflowFormPanelProps> = ({ node }) => {
  const formApiRef = useRef<any>(null);

  const execEntity = useExecStateEntity();
  const runService = useService<WorkflowRunService>(WorkflowRunService);
  const reporter = useTestRunReporterService();

  const bizCtx = useTestsetBizCtx();

  const { validate } = useValidateWorkflow();
  const floatLayoutService = useFloatLayoutService();
  const globalState = useGlobalState();
  const userInfo = userStoreService.useUserInfo();
  const result = execEntity.getEndNodeResult();
  const { getNode } = useGetStartNode();
  const { sessionInfo } = useChatflowInfo();

  const { running } = useTestRunStatus(START_NODE_ID);

  const { updateRunStatus, logNodeRef, logView } = useLogView();

  const showResult =
    !!result?.nodeStatus &&
    [NodeExeStatus.Success, NodeExeStatus.Fail].includes(result.nodeStatus);

  const testRunFlowV3 = async () => {
    const hasError = await validate();
    if (hasError) {
      floatLayoutService.open('problemPanel', 'bottom');
      return;
    }
    if (!formApiRef.current) {
      return;
    }
    const {
      empty,
      validate: formValidate,
      values,
    } = await formApiRef.current.submit();
    if (!formValidate) {
      Toast.error(I18n.t('workflow_testrun_form_vailate_error_toast'));
      return;
    }
    let inputData: object | undefined;
    let input: Record<string, string> | undefined;
    let related: Record<string, string> | undefined;
    let botId: string | undefined;
    let testsetSave: boolean | undefined;
    if (!empty) {
      inputData = values?.[TestFormFieldName.Node]?.[TestFormFieldName.Input];
      input = stringifyValue(inputData as object);
      related = values?.[TestFormFieldName.Related];
      botId = related?.[TestFormFieldName.Bot] as any;
      testsetSave = values?.[TestFormFieldName.TestsetSave];
    }

    if (testsetSave) {
      const checkMsg = await trySaveTestset({
        values: inputData,
        bot: botId,
        schema: formApiRef.current.originSchema,
        bizCtx,
        node,
        workflowId: globalState.workflowId,
      });

      if (checkMsg?.checkError) {
        return;
      }
    }

    reporter.formRunUIMode({
      form_ui_mode: formApiRef.current.getUIMode(),
    });

    const useProject = sessionInfo?.type === IntelligenceType.Project;
    await runService.testRun(input, (botId as any)?.id || botId, useProject);

    const currentNodeStatus = execEntity.getEndNodeResult()?.nodeStatus;

    updateRunStatus(currentNodeStatus);

    if (
      currentNodeStatus === NodeExeStatus.Success &&
      testsetSave &&
      formApiRef.current.innerForm
    ) {
      formApiRef.current.innerForm.setValueIn(
        TestFormFieldName.TestsetSave,
        false,
      );
    }
  };

  const handleSubmit = async () => {
    // The result of closing a practice run first
    runService.clearTestRun();
    await testRunFlowV3();
  };

  return (
    <div className={styles['test-form-v2']}>
      <TestsetManageProvider
        spaceId={globalState.spaceId}
        workflowId={globalState.workflowId}
        userId={userInfo?.user_id_str}
        nodeId={getNode()?.id}
        projectId={globalState.projectId}
        formRenders={{
          [FormItemSchemaType.BOT]: TestsetBotProjectSelect as any,
          [FormItemSchemaType.LIST]: JsonEditorSemi as any,
          [FormItemSchemaType.OBJECT]: JsonEditorSemi as any,
        }}
      >
        <TestFormSheetHeaderV2 />

        <PremiumPaywallBanner scene={PremiumPaywallBannerScene.Token} />
        <div ref={logNodeRef} className={styles['test-form-content']}>
          <div
            className={cls('w-full h-full', {
              [styles['test-form-content-absolute']]: running,
            })}
          >
            <TestFormV3 node={node} onMounted={v => (formApiRef.current = v)} />

            {showResult ? <ResultLog result={result} extra={logView} /> : null}
          </div>

          {running ? <RunningPanel /> : null}
        </div>
        <TestFormSheetFooterV2 onClick={() => handleSubmit()} />
        <TestsetEditPanel />
        <QuestionForm />
        <InputForm />
      </TestsetManageProvider>
    </div>
  );
};

const StartTestFormSheet: React.FC<TestWorkflowFormPanelProps> = props => (
  <PanelWrap layout="vertical">
    <ResizableSidePanel>
      <FormPanelLayout>
        <TestFormSheetV2 {...props} />
      </FormPanelLayout>
    </ResizableSidePanel>
  </PanelWrap>
);

export { TestFormSheetV2, StartTestFormSheet, type TestWorkflowFormPanelProps };
