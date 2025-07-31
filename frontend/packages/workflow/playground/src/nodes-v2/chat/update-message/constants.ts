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

import { nanoid } from 'nanoid';
import { ValueExpressionType, ViewVariableType } from '@coze-workflow/variable';
import { VariableTypeDTO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { CONVERSATION_NAME } from '../constants';

export const FIELD_CONFIG = {
  conversationName: {
    description: I18n.t('workflow_250407_010'),
    name: CONVERSATION_NAME,
    required: true,
    type: VariableTypeDTO.string,
  },

  messageId: {
    description: I18n.t('workflow_250407_011'),
    name: 'messageId',
    required: true,
    type: VariableTypeDTO.string,
  },

  newContent: {
    description: I18n.t('workflow_250407_012'),
    name: 'newContent',
    required: true,
    type: VariableTypeDTO.string,
  },
};

export const DEFAULT_CONVERSATION_VALUE = Object.keys(FIELD_CONFIG).map(
  fieldName => ({
    name: fieldName,
    input: {
      type: ValueExpressionType.REF,
    },
  }),
);

export const DEFAULT_OUTPUTS = [
  {
    key: nanoid(),
    name: 'isSuccess',
    type: ViewVariableType.Boolean,
  },
];
