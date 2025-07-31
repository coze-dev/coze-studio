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

import { InputForm as InputFormCore } from '@coze-workflow/test-run/input';
import { EventType } from '@coze-arch/bot-api/workflow_api';

import { useExecStateEntity, useGlobalState } from '@/hooks';

export const InputForm = () => {
  const { workflowId, spaceId } = useGlobalState();
  const exeState = useExecStateEntity();
  const nodeInputEvent = exeState.getNodeEvent(EventType.InputNode);

  return (
    <InputFormCore
      spaceId={spaceId}
      workflowId={workflowId}
      executeId={exeState.config.executeId}
      inputEvent={nodeInputEvent}
    />
  );
};
