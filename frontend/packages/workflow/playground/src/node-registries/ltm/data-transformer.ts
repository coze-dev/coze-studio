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
 
import {
  ValueExpressionType,
  type LiteralExpression,
  ViewVariableType,
} from '@coze-workflow/base';
import { getFlags } from '@coze-arch/bot-flags';

import { type FormData, type DTODataWhenInit } from './types';
import { OUTPUTS } from './constants';

const HISTORY_FIELDS = ['enableChatHistory', 'chatHistoryRound'];
const DEFAULT_VALUE = [
  { name: 'Query', input: { type: ValueExpressionType.REF } },
];

/**
 * 节点后端数据 -> 前端表单数据
 */
export const transformOnInit = (value: DTODataWhenInit): FormData => {
  // 拖入节点，value 为 null
  // 创建副本，value.inputs.inputParameters 数组为空
  const inputParameters = value?.inputs?.inputParameters ?? [];
  const inputParametersWithNoHistoryFields = inputParameters.filter(
    v => !HISTORY_FIELDS.includes(v.name || ''),
  );
  const historySwitchItem = inputParameters.find(
    v => v.name === 'enableChatHistory',
  )?.input as LiteralExpression;

  const historyRoundItem = inputParameters.find(
    v => v.name === 'chatHistoryRound',
  )?.input as LiteralExpression;

  return {
    nodeMeta: value?.nodeMeta,
    inputs: {
      inputParameters:
        inputParametersWithNoHistoryFields.length === 0
          ? DEFAULT_VALUE
          : inputParametersWithNoHistoryFields,

      // 历史会话设置
      historySetting: {
        // 是否开启历史会话
        enableChatHistory: Boolean(historySwitchItem?.content),

        // 历史会话轮数，默认为 3
        chatHistoryRound: (historyRoundItem?.content as number) ?? 3,
      },
    },

    outputs: value?.outputs ?? OUTPUTS,
  };
};

/**
 * 前端表单数据 -> 节点后端数据
 * @param value
 * @returns
 */
export const transformOnSubmit = (value: FormData): DTODataWhenInit => {
  const { inputParameters, historySetting } = value.inputs;

  if (getFlags()['bot.automation.ltm_enhance']) {
    inputParameters.push({
      name: 'enableChatHistory',
      input: {
        content: historySetting.enableChatHistory,
        type: ValueExpressionType.LITERAL,
        rawMeta: {
          type: ViewVariableType.Boolean,
        },
      },
    });

    inputParameters.push({
      name: 'chatHistoryRound',
      input: {
        content: historySetting.chatHistoryRound,
        type: ValueExpressionType.LITERAL,
        rawMeta: {
          type: ViewVariableType.Integer,
        },
      },
    });
  }

  const result = {
    nodeMeta: value?.nodeMeta,
    inputs: {
      inputParameters,
    },
    outputs: value?.outputs,
  };

  return result;
};
