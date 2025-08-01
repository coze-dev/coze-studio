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
import {
  type IFormSchema,
  TestFormFieldName,
} from '@coze-workflow/test-run-next';
import { I18n } from '@coze-arch/i18n';
import { IntelligenceType } from '@coze-arch/bot-api/intelligence_api';
interface GenerateEnvToRelatedContextPropertiesOptions {
  isNeedBot: boolean;
  isNeedConversation?: boolean;
  hasVariableAssignNode?: boolean;
  hasLTMNode?: boolean;
  hasConversationNode?: boolean;
  disableBot?: boolean;
  disableBotTooltip?: string;
  disableProject?: boolean;
  disableProjectTooltip?: string;
}

export const generateEnvToRelatedContextProperties = (
  options: GenerateEnvToRelatedContextPropertiesOptions,
) => {
  const field: IFormSchema = {
    ['x-component']: 'RelatedFieldCollapse',
  };

  const { isNeedBot, isNeedConversation } = options;
  if (!isNeedBot && !isNeedConversation) {
    return null;
  }
  field['x-component-props'] = options as any;
  field['x-validator'] = (({ value }) => {
    const botValue = value?.[TestFormFieldName.Bot];
    const conversationValue = value?.[TestFormFieldName.Conversation];
    if (isNeedBot && !botValue) {
      return {
        type: 'bot',
        message: I18n.t('workflow_testset_required_tip', {
          param_name: 'Bot',
        }),
      };
    }
    if (
      isNeedConversation &&
      botValue?.type === IntelligenceType.Project &&
      !conversationValue
    ) {
      return {
        type: 'conversation',
        message: I18n.t('workflow_testset_required_tip', {
          param_name: 'Conversation',
        }),
      };
    }
  }) as any;

  return field;
};
