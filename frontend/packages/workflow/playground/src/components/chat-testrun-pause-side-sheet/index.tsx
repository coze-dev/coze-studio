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

import { useState, useEffect } from 'react';

// import { useMutation } from '@tanstack/react-query';
import { EventType, workflowApi } from '@coze-workflow/base/api';
import { I18n } from '@coze-arch/i18n';
import { SideSheet } from '@coze-arch/coze-design';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';
import { UIIconButton } from '@coze-arch/bot-semi';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { IconClose } from '@douyinfe/semi-icons';

import { useCancelTestRun } from '../test-run/hooks/use-cancel-test-run';
import { WorkflowRunService } from '../../services';
import { useExecStateEntity, useGlobalState } from '../../hooks';
// import { useGenerateMessageFormInitValue } from './use-generate-message-form-init-value';
import { type MessageFormValue } from './types';
import { Title } from './title';
import { MessageForm } from './message-form';

export const ChatTestRunPauseSideSheet = () => {
  const [visible, setVisible] = useState(false);

  const { workflowId, spaceId } = useGlobalState();

  const { cancelTestRun } = useCancelTestRun();

  const exeState = useExecStateEntity();

  const testrunService = useService<WorkflowRunService>(WorkflowRunService);

  const sceneChatNodeEvent = exeState.getNodeEvent(EventType.SceneChat);

  // const generateMessageFormInitValue = useGenerateMessageFormInitValue();

  // const { mutate } = useMutation({
  //   mutationFn: workflowApi.WorkFlowTestResume,
  //   onSuccess: () => {
  //     debugger;
  //     testrunService.continueTestRun();
  //     setVisible(false);
  //   },
  // });

  useEffect(() => {
    if (sceneChatNodeEvent) {
      testrunService.pauseTestRun();
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [sceneChatNodeEvent]);

  const handleClose = () => {
    setVisible(false);
    cancelTestRun();
  };

  const handleMessageFormSubmit = async (values: MessageFormValue) => {
    await workflowApi.WorkFlowTestResume({
      workflow_id: workflowId,
      execute_id: exeState.config.executeId,
      event_id: sceneChatNodeEvent?.id ?? '',
      space_id: spaceId,
      data: JSON.stringify(values),
    });

    testrunService.continueTestRun();
    setVisible(false);

    // debugger;
    // mutate({
    //   workflow_id: workflowId,
    //   execute_id: exeState.config.executeId,
    //   event_id: sceneChatNodeEvent?.id ?? '',
    //   data: JSON.stringify(values),
    // });
  };

  if (visible) {
    return (
      <SideSheet
        visible={visible}
        closable={false}
        width={600}
        title={
          <div className="flex items-center">
            <UIIconButton
              type="secondary"
              icon={<IconClose style={{ color: '#1C1D23' }} />}
              iconSize="large"
              onClick={handleClose}
            />
            {I18n.t(
              'scene_workflow_chat_node_test_run_title',
              {},
              'Test Q&A nodes',
            )}
          </div>
        }
        style={{
          background: '#F7F7FA',
        }}
      >
        <div className="h-full flex flex-col">
          <Title icon={sceneChatNodeEvent?.node_icon ?? ''} />
          <div className="flex-1">
            <MessageForm
              initValues={{
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                Messages: (typeSafeJSONParse(sceneChatNodeEvent?.data) as any)
                  ?.messages,

                // messages:
                //   generateMessageFormInitValue(
                //     // eslint-disable-next-line @typescript-eslint/no-explicit-any
                //     (typeSafeJSONParse(sceneChatNodeEvent?.data) as any)
                //       ?.messages,
                //   ) ?? [],
              }}
              onSubmit={handleMessageFormSubmit}
            />
          </div>
        </div>
      </SideSheet>
    );
  } else {
    return null;
  }
};
