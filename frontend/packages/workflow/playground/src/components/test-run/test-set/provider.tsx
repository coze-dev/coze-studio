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

/* eslint-disable @typescript-eslint/no-explicit-any -- TODO: Temporary processing, the component will be changed later */
import {
  TestsetManageEventName,
  TestsetManageProvider,
  FormItemSchemaType,
} from '@coze-devops/testset-manage';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { ComponentType } from '@coze-arch/bot-api/debugger_api';

import { JsonEditorSemi } from '../test-form-materials/json-editor';
import { BotSelectTestset } from '../test-form-materials/bot-select';
import { useTestsetBizCtx } from '../hooks/use-testset-biz-ctx';
import { useGetStartNode } from '../hooks/use-get-start-node';
import { useGlobalState } from '../../../hooks';

/** Report event tracking */
function reportEvent(
  evtName: TestsetManageEventName,
  payload?: Record<string, unknown>,
) {
  switch (evtName) {
    case TestsetManageEventName.CREATE_TESTSET_SUCCESS:
      sendTeaEvent(EVENT_NAMES.workflow_create_testset, payload);
      break;
    case TestsetManageEventName.AIGC_PARAMS_CLICK:
      sendTeaEvent(EVENT_NAMES.workflow_aigc_params, payload);
      break;
    default:
      break;
  }
}

export const Provider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const globalState = useGlobalState();
  const bizCtx = useTestsetBizCtx();
  const { getNode } = useGetStartNode();
  return (
    <TestsetManageProvider
      bizCtx={bizCtx}
      bizComponentSubject={{
        // Currently only the start node has Testset management
        componentID: getNode()?.id,
        componentType: ComponentType.CozeStartNode,
        parentComponentID: globalState.workflowId,
        parentComponentType: ComponentType.CozeWorkflow,
      }}
      editable={!globalState.config.preview}
      formRenders={{
        [FormItemSchemaType.BOT]: BotSelectTestset as any,
        [FormItemSchemaType.LIST]: JsonEditorSemi as any,
        [FormItemSchemaType.OBJECT]: JsonEditorSemi as any,
      }}
      reportEvent={reportEvent}
    >
      {children}
    </TestsetManageProvider>
  );
};
