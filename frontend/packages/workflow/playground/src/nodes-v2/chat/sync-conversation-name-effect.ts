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

import { set, cloneDeep } from 'lodash-es';
import {
  DataEvent,
  type EffectOptions,
  type Effect,
  FlowNodeFormData,
  type FormModelV2,
} from '@flowgram-adapter/free-layout-editor';
import { ValueExpression, WorkflowMode } from '@coze-workflow/base';

import { CONVERSATION_NAME } from './constants';

/** Delay 200ms. At this time, the variable scope can only be detected after the equilateral connection is connected. */
const DELAY = 200;

const effect: Effect = ({ value, context }) => {
  if (!context) {
    return;
  }
  const { node, playgroundContext } = context;

  const { variableService, nodesService, globalState } = playgroundContext;
  const startNode = nodesService.getStartNode();
  const formModel = node.getData(FlowNodeFormData).getFormModel<FormModelV2>();
  const isChatflow = globalState.flowMode === WorkflowMode.ChatFlow;
  const { isInIDE } = globalState;

  setTimeout(() => {
    const startConversationNameVar =
      variableService.getWorkflowVariableByKeyPath(
        [startNode.id, 'CONVERSATION_NAME'],
        {
          node,
          checkScope: true,
        },
      );

    const clonedValue = cloneDeep(value);
    const conversationNameItem = clonedValue.find(
      v => v.name === CONVERSATION_NAME,
    );
    const noValue = ValueExpression.isEmpty(
      conversationNameItem?.input as ValueExpression,
    );

    // If you can find the CONVERSATION_NAME parameters of the start node
    if (
      startConversationNameVar &&
      conversationNameItem &&
      isChatflow &&
      noValue
    ) {
      if (formModel) {
        set(conversationNameItem, 'input', {
          type: 'ref',
          content: {
            keyPath: ['100001', 'CONVERSATION_NAME'],
          },
        });
        formModel.setValueIn('inputParameters', clonedValue);
      }
    } else if (!isInIDE && !isChatflow && conversationNameItem && noValue) {
      // Non-project workflow, if there is a CONVERSATION_NAME field with no value, fill in the default value default
      if (formModel) {
        set(conversationNameItem, 'input', {
          type: 'literal',
          content: 'Default',
        });
        formModel.setValueIn('inputParameters', clonedValue);
      }
    }
  }, DELAY);
};

export const syncConversationNameEffect: EffectOptions[] = [
  {
    event: DataEvent.onValueInit,
    effect,
  },
];
