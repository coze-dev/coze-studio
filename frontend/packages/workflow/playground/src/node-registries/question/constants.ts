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

import { nanoid } from '@flowgram-adapter/free-layout-editor';
import { ViewVariableType } from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';

export const DEFAULT_USER_RESPONSE_PARAM_NAME = 'USER_RESPONSE';
export const DEFAULT_OPTION_ID_NAME = 'optionId';
export const DEFAULT_OPTION_CONTENT_NAME = 'optionContent';

export const DEFAULT_OUTPUT_NAMES = [
  DEFAULT_USER_RESPONSE_PARAM_NAME,
  DEFAULT_OPTION_ID_NAME,
  DEFAULT_OPTION_CONTENT_NAME,
];

export const DEFAULT_USE_RESPONSE = [
  {
    key: nanoid(),
    name: DEFAULT_USER_RESPONSE_PARAM_NAME,
    type: ViewVariableType.String,
    required: true,
    description: I18n.t(
      'workflow_ques_ans_type_direct_key_decr',
      {},
      '用户本轮对话输入内容',
    ),
  },
];

export const DEFAULT_EXTRACT_OUTPUT = [
  {
    key: nanoid(),
    name: 'output',
    type: ViewVariableType.String,
    required: true,
  },
];

export const DEFAULT_ANSWER_OPTION_OUTPUT = [
  {
    key: nanoid(),
    name: DEFAULT_OPTION_ID_NAME,
    type: ViewVariableType.String,
    required: false,
  },
  {
    key: nanoid(),
    name: DEFAULT_OPTION_CONTENT_NAME,
    type: ViewVariableType.String,
    required: false,
  },
];
