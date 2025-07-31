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
import { useRef } from 'react';

import { TestFormFieldName } from '@coze-workflow/test-run-next';
import {
  ResizablePanel,
  TestsetEditPanel,
  TestsetManageProvider,
  FormItemSchemaType,
} from '@coze-workflow/test-run';
import { userStoreService } from '@coze-studio/user-store';
import {
  PremiumPaywallBanner,
  PremiumPaywallBannerScene,
} from '@coze-studio/premium-components-adapter';
import { I18n } from '@coze-arch/i18n';
import { IconCozPlayFill } from '@coze-arch/coze-design/icons';
import { Button, Toast, Typography } from '@coze-arch/coze-design';

import { type WorkflowNodeEntity } from '@/test-run-kit';
import { useValidateWorkflow } from '@/hooks/use-validate-workflow';
import {
  useFloatLayoutService,
  useGlobalState,
  useTestRunReporterService,
} from '@/hooks';

import { trySaveTestset } from '../test-form-v3/mode-form-kit';
import { TestFormV3 } from '../test-form-v3';
import { JsonEditorSemi } from '../test-form-materials/json-editor';
import { ConversationSelectTestset } from '../test-form-materials/conversation-select';
import { useTestsetBizCtx } from '../hooks/use-testset-biz-ctx';
import { useGetStartNode } from '../hooks/use-get-start-node';
import { FieldName } from '../constants';
import { TestsetBotProjectSelect } from './testset-bot-project-select';
import { useChatFlowTestFormStore } from './test-form-provider';

import css from './test-form.module.less';

interface TestWorkflowFormPanelProps {
  node: WorkflowNodeEntity;
}

export const ChatFlowTestForm: React.FC<TestWorkflowFormPanelProps> = ({
  node,
}) => {
  const formApiRef = useRef<any>(null);
  const globalState = useGlobalState();
  const { patch, formData } = useChatFlowTestFormStore(store => ({
    patch: store.patch,
    formData: store.formData,
  }));
  const userInfo = userStoreService.useUserInfo();
  const { getNode } = useGetStartNode();
  const reporter = useTestRunReporterService();
  const { validate } = useValidateWorkflow();
  const floatLayoutService = useFloatLayoutService();
  const panelRef = useRef<any>(null);
  const bizCtx = useTestsetBizCtx();

  const testRunChatFlowV3 = async () => {
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
    if (!empty) {
      reporter.formRunUIMode({
        form_ui_mode: formApiRef.current.getUIMode(),
      });
      const testsetSave = values?.[TestFormFieldName.TestsetSave];
      if (testsetSave) {
        const botId = values?.[FieldName.Bot];
        const inputData = values?.[FieldName.Node]?.[FieldName.Input];
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
    }
    patch({ formData: values });
    panelRef.current?.close();
  };

  const handleClose = () => {
    patch({ visible: false });
  };

  return (
    <TestsetManageProvider
      spaceId={globalState.spaceId}
      workflowId={globalState.workflowId}
      userId={userInfo?.user_id_str}
      nodeId={getNode()?.id}
      projectId={globalState.projectId}
      formRenders={{
        [FormItemSchemaType.CHAT]: ConversationSelectTestset as any,
        [FormItemSchemaType.BOT]: TestsetBotProjectSelect as any,
        [FormItemSchemaType.LIST]: JsonEditorSemi as any,
        [FormItemSchemaType.OBJECT]: JsonEditorSemi as any,
      }}
    >
      <ResizablePanel
        animation={'translateY'}
        header={
          <div className={css['test-form-header']}>
            <Typography.Text strong fontSize="16px">
              {I18n.t('wf_chatflow_71')}
            </Typography.Text>
          </div>
        }
        headerExtra={
          <PremiumPaywallBanner scene={PremiumPaywallBannerScene.Token} />
        }
        className={css['resizable-panel']}
        footer={
          <Button
            color="green"
            className="w-full"
            icon={<IconCozPlayFill />}
            onClick={() => {
              testRunChatFlowV3();
            }}
          >
            {I18n.t('wf_chatflow_75')}
          </Button>
        }
        ref={panelRef}
        hideClose={!formData}
        onClose={handleClose}
      >
        <TestFormV3 node={node} onMounted={v => (formApiRef.current = v)} />

        <TestsetEditPanel
          isChatFlow
          onParentClose={() => {
            panelRef.current.close();
          }}
        />
      </ResizablePanel>
    </TestsetManageProvider>
  );
};
