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

import React from 'react';

import { type InputValueVO, useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { ValueExpressionInputField } from '@/node-registries/common/fields';
import { useGlobalState } from '@/hooks';
import {
  ColumnTitles,
  FieldArrayItem,
  FieldArrayList,
  Section,
  useFieldArray,
  withFieldArray,
} from '@/form';

import {
  INPUT_CHAT_HISTORY_SETTING_ENABLE,
  INPUT_CHAT_HISTORY_SETTING_ROUND,
  COLUMNS,
  INPUT_PATH,
} from '../../constants';
import { ChatHistoryEnableSwitch, ChatHistoryPanel } from './chat-history';

const InputsParametersField = withFieldArray(() => {
  const { name: fieldName, value } = useFieldArray<InputValueVO>();
  const safeValue = value || [];
  const { getNodeSetterId } = useNodeTestId();
  const { isChatflow } = useGlobalState();

  return (
    <Section
      title={I18n.t('workflow_detail_node_parameter_input')}
      tooltip={I18n.t('workflow_intent_input_tooltips')}
      testId={getNodeSetterId(fieldName)}
      actions={
        isChatflow
          ? [
              <ChatHistoryEnableSwitch
                name={INPUT_CHAT_HISTORY_SETTING_ENABLE}
                testId={getNodeSetterId('chatHistorySetting')}
              />,
            ]
          : []
      }
    >
      {isChatflow ? (
        <ChatHistoryPanel name={INPUT_CHAT_HISTORY_SETTING_ROUND} />
      ) : null}

      <ColumnTitles columns={COLUMNS} />

      <FieldArrayList>
        {safeValue?.map(({ name }, index) => (
          <FieldArrayItem hiddenRemove>
            <ValueExpressionInputField
              key={index}
              label={name}
              required
              name={`${fieldName}.${index}.input`}
            />
          </FieldArrayItem>
        ))}
      </FieldArrayList>
    </Section>
  );
});

export default function InputsParameters() {
  return (
    <InputsParametersField
      name={INPUT_PATH}
      defaultValue={[{ name: 'query' }]}
    />
  );
}
