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

import { get, isNil, omit } from 'lodash-es';
import { type NodeFormContext } from '@flowgram-adapter/free-layout-editor';
import { variableUtils } from '@coze-workflow/variable';
import {
  formatModelData,
  getDefaultLLMParams,
  INTENT_NODE_MODE,
} from '@coze-workflow/nodes';
import { type NodeDataDTO, type ValueExpression } from '@coze-workflow/base';

import { type FormData } from './types';
import { getDefaultOutputs } from './constants';

/**
 * Node Backend Data - > Frontend Form Data
 */
export const transformOnInit = (
  value: NodeDataDTO,
  context: NodeFormContext,
) => {
  const { playgroundContext } = context || {};
  const { inputs, nodeMeta, outputs } = value || {};

  let llmParam: Record<string, unknown> | undefined = get(
    inputs,
    'llmParam',
  ) as Record<string, unknown>;

  const { models } = playgroundContext;

  // When first dragged into the canvas: Parse out the default value from the backend return value.
  if (!llmParam) {
    llmParam = getDefaultLLMParams(models);
  }

  const model: { [k: string]: unknown } = { ...llmParam };
  const isNewCreateInInit = isNil(inputs);
  const inputParameters = get(inputs, 'inputParameters', []);

  // - If it is a new node, the default is fast mode, otherwise it is determined according to the backend return value (if there is no backend mode field, it means it is historical data, then it is standard mode)
  // - will support soon
  const intentModeInInit =
    isNewCreateInInit && !IS_OPEN_SOURCE
      ? INTENT_NODE_MODE.MINIMAL
      : (get(inputs, 'mode') as string) || INTENT_NODE_MODE.STANDARD;
  const isMinimalMode = intentModeInInit === INTENT_NODE_MODE.MINIMAL;
  const emptyIntent = [{ name: '' }];

  const intentsValue = get(inputs, 'intents', emptyIntent);

  return {
    nodeMeta,
    outputs: outputs || getDefaultOutputs(intentModeInInit),

    model: omit(model, [
      'enableChatHistory',
      'systemPrompt',
      'chatHistoryRound',
    ]) as { [k: string]: unknown },

    // The open-source version only supports standard mode
    intentMode: intentModeInInit,

    intents: isMinimalMode ? emptyIntent : intentsValue,

    quickIntents: isMinimalMode ? intentsValue : emptyIntent,

    inputs: {
      chatHistorySetting: {
        enableChatHistory: llmParam.enableChatHistory || false,
        chatHistoryRound: llmParam.chatHistoryRound || 3,
      },
      inputParameters:
        inputParameters.length === 0 ? [{ name: 'query' }] : inputParameters,
    },
    systemPrompt:
      (llmParam?.systemPrompt as Record<string, Record<string, unknown>>)?.value
        ?.content ?? '',
  };
};

/**
 * Front-end form data - > node back-end data
 * @param value
 * @returns
 */
export const transformOnSubmit = (
  value: FormData,
  context: NodeFormContext,
): NodeDataDTO => {
  const { playgroundContext } = context || {};
  const {
    model,
    inputs,
    intents,
    quickIntents,
    intentMode,
    systemPrompt,
    nodeMeta,
    outputs,
  } = value || {};
  const { chatHistorySetting, inputParameters } = inputs || {};
  const { enableChatHistory, chatHistoryRound } = chatHistorySetting || {};

  const { models, globalState, variableService, node } =
    playgroundContext || {};

  const { isChatflow } = globalState || {};

  const modelMeta = models.find(m => m.model_type === model.modelType);

  const promptItem = {
    type: 'literal',
    content: '{{query}}',
  };
  const systemPromptItem = {
    type: 'literal',
    content: intentMode === INTENT_NODE_MODE.MINIMAL ? '' : systemPrompt,
  };

  const formattedValue: Record<string, unknown> = {
    nodeMeta,
    outputs,
    inputs: {
      ...(inputs || {}),
      inputParameters,
      llmParam: {
        ...formatModelData(model, modelMeta),
        modelName: modelMeta?.name ?? '',
        prompt: variableUtils.valueExpressionToDTO(
          promptItem as ValueExpression,
          variableService,
          {
            node,
          },
        ),
        systemPrompt: variableUtils.valueExpressionToDTO(
          systemPromptItem as ValueExpression,
          variableService,
          {
            node,
          },
        ),

        // If it is a workflow, the history is closed by default when submitting, and the dialog flow is submitted according to the actual value of the user.
        enableChatHistory: isChatflow ? Boolean(enableChatHistory) : false,

        // History rounds
        chatHistoryRound,
      },
      intents: intentMode === INTENT_NODE_MODE.MINIMAL ? quickIntents : intents,
      mode: intentMode,
    },
  };

  return formattedValue as unknown as NodeDataDTO;
};
