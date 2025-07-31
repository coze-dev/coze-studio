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

import { useEffect } from 'react';

import { useMemoizedFn } from 'ahooks';
import { FormPanelLayout } from '@coze-workflow/test-run';
import { USER_INPUT } from '@coze-workflow/base';
import { CreateEnv } from '@coze-arch/idl/workflow_api';
import {
  IntelligenceType,
  type IntelligenceBasicInfo,
} from '@coze-arch/idl/intelligence_api';

import { type WorkflowNodeEntity } from '@/test-run-kit';
import { useGlobalState, useWorkflowRunService } from '@/hooks';
import { WorkflowExecStatus } from '@/entities';
import { useChatflowInfo } from '@/components/test-run/hooks/use-chatflow-info';
import { ResizableSidePanel } from '@/components/resizable-side-panel';

import { TestFormHeader } from '../test-form-header';
import { useTestFormSchema } from '../hooks/use-test-form-schema';
import {
  useGetStartNode,
  useGetStartNodeOutputs,
} from '../hooks/use-get-start-node';
import { FieldName } from '../constants';
import { ChatHistory } from '../chat-history';
import { PanelWrap } from '../../float-layout';
import {
  ChatFlowTestFormProvider,
  useChatFlowTestFormStore,
} from './test-form-provider';
import { TestFormFloatButton } from './test-form-float-button';
import { ChatFlowTestForm } from './test-form';
import { ConversationSelect } from './conversation-select';

import css from './test-form-panel.module.less';

export interface ChatFlowTestFormPanelProps {
  node: WorkflowNodeEntity;
}

const ChatFlowTestRunHistory = (props: {
  projectInfo?: IntelligenceBasicInfo;
  showInputArea?: boolean;
}) => {
  const { formData } = useChatFlowTestFormStore(store => ({
    formData: store.formData,
  }));
  const { projectInfo, ...restProps } = props;
  const { config } = useGlobalState();
  const { getNode } = useGetStartNode();
  const { getStartNodeOutputs } = useGetStartNodeOutputs();

  const startNode = getNode();
  let defaultText = '';
  if (startNode) {
    const outputs = getStartNodeOutputs();
    defaultText =
      outputs.find(output => output.name === USER_INPUT)?.defaultValue || '';
  }
  const runService = useWorkflowRunService();
  const { sessionInfo, conversationInfo } = useChatflowInfo();
  const inputData = formData?.[FieldName.Node]?.[FieldName.Input];
  const projectOrBotInfo = sessionInfo
    ? {
        id: sessionInfo.value,
        name: sessionInfo.name,
        iconUrl: sessionInfo.avatar,
        type: sessionInfo.type,
      }
    : {
        id: projectInfo?.id || '',
        name: projectInfo?.name || '',
        iconUrl: projectInfo?.icon_url || '',
        type: IntelligenceType.Project,
      };

  // Get the default value of the start node
  return (
    <ChatHistory
      type={CreateEnv.Draft}
      projectOrBotInfo={projectOrBotInfo}
      workflowInfo={{
        id: config.workflowId,
        parameters: inputData,
        header: {
          'rpc-persist-mock-traffic-enable': '1',
        },
      }}
      activateChat={{
        unique_id: conversationInfo?.value,
        conversation_name:
          projectOrBotInfo?.type === IntelligenceType.Bot
            ? projectOrBotInfo?.name
            : conversationInfo?.label,
        conversation_id: conversationInfo?.conversationId,
      }}
      onGetChatFlowExecuteId={(executeId: string) => {
        // Help backend @zhangshiqi.live compatibility logic
        // Do not use the newly given executeId when there is already a polling in progress
        if (
          runService.globalState.viewStatus === WorkflowExecStatus.EXECUTING
        ) {
          return;
        }
        runService.clearTestRun();
        runService.getRTProcessResult({ executeId });
      }}
      topSlot={(isChatError?: boolean) => (
        <TestFormFloatButton isChatError={isChatError} />
      )}
      defaultText={defaultText}
      {...restProps}
    />
  );
};

const ChatflowFormPanel = ({ node }: ChatFlowTestFormPanelProps) => {
  const { visible, patch } = useChatFlowTestFormStore(store => ({
    visible: store.visible,
    patch: store.patch,
  }));
  const { generate } = useTestFormSchema();
  const init = useMemoizedFn(async () => {
    const schema = await generate();
    if (schema?.fields.length) {
      patch({ visible: true, hasForm: true });
    }
  });
  useEffect(() => {
    // Open by default
    init();
  }, []);
  return visible ? <ChatFlowTestForm node={node} /> : null;
};

export const ChatFlowTestFormPanel: React.FC<ChatFlowTestFormPanelProps> = ({
  node,
}) => {
  const { getProjectApi } = useGlobalState();
  const projectInfo = getProjectApi()?.ideGlobalStore(
    store => store.projectInfo?.projectInfo,
  );

  return (
    <PanelWrap layout="vertical">
      <ChatFlowTestFormProvider>
        <ResizableSidePanel>
          <FormPanelLayout className={css['test-form']}>
            <TestFormHeader />
            <ConversationSelect />
            <ChatFlowTestRunHistory
              projectInfo={projectInfo}
              showInputArea={true}
            />
            <ChatflowFormPanel node={node} />
          </FormPanelLayout>
        </ResizableSidePanel>
      </ChatFlowTestFormProvider>
    </PanelWrap>
  );
};
