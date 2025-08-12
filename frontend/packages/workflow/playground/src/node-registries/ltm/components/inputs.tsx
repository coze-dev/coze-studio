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

import React, { type PropsWithChildren } from 'react';

import {
  useNodeTestId,
  type InputValueVO,
  type ViewVariableType,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { getFlags } from '@coze-arch/bot-flags';

import { ValueExpressionInputField } from '@/node-registries/common/fields';
import { useGlobalState } from '@/hooks';
import {
  Section,
  useFieldArray,
  ColumnTitles,
  FieldArrayList,
  FieldArrayItem,
  withFieldArray,
  useWatch,
} from '@/form';

import { COLUMNS } from '../constants';
import { HistorySwitchField } from './history-switch-field';
import { HistoryRoundField } from './history-round-field';

interface InputsProps {
  inputType?: ViewVariableType;
  disabledTypes?: ViewVariableType[];
}

export const Inputs = withFieldArray(
  ({ inputType, disabledTypes }: InputsProps & PropsWithChildren) => {
    const { name: fieldName, value } = useFieldArray<InputValueVO>();
    const safeValue = value || [];
    const { getNodeSetterId } = useNodeTestId();
    const { isChatflow } = useGlobalState();
    const enableChatHistory = useWatch<boolean>(
      'inputs.historySetting.enableChatHistory',
    );
    const FLAGS = getFlags();

    return (
      <Section
        title={I18n.t('workflow_detail_node_parameter_input')}
        tooltip={I18n.t('ltm_240826_01')}
        testId={getNodeSetterId(fieldName)}
        actions={[
          // Support soon, so stay tuned.
          isChatflow && FLAGS['bot.automation.ltm_enhance'] ? (
            <HistorySwitchField name="inputs.historySetting.enableChatHistory" />
          ) : null,
        ]}
      >
        <ColumnTitles columns={COLUMNS} />

        <FieldArrayList>
          {safeValue?.map(({ name }, index) => (
            <FieldArrayItem hiddenRemove>
              <ValueExpressionInputField
                key={index}
                label={name}
                required
                inputType={inputType}
                disabledTypes={disabledTypes}
                name={`${fieldName}.${index}.input`}
              />
            </FieldArrayItem>
          ))}
        </FieldArrayList>

        {isChatflow ? (
          <div className="mt-[4px]">
            {enableChatHistory ? (
              <HistoryRoundField
                name="inputs.historySetting.chatHistoryRound"
                showLine
              />
            ) : null}
          </div>
        ) : null}
      </Section>
    );
  },
);
