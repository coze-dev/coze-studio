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
          // 社区版暂不支持该功能
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
