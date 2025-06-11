import React from 'react';

import { FILE_TYPES, ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { Section, useWatch } from '@/form';

import {
  DEFAULT_EXTRACT_OUTPUT,
  DEFAULT_ANSWER_OPTION_OUTPUT,
} from '../constants';
import {
  CheckboxWithTipsField,
  OutputsDisplayField,
  OutputsField,
} from '../../common/fields';
import { QuestionLimit } from './question-limit';

export const QuestionOutputs = () => {
  const answerType = useWatch({ name: 'questionParams.answer_type' });
  const extraOutput = useWatch<Boolean>({
    name: 'questionOutputs.extra_output',
  });
  const isOptionAnswer = answerType === 'option';

  return (
    <Section
      title={I18n.t('workflow_detail_node_output')}
      tooltip={I18n.t('workflow_ques_output_tooltips')}
      actions={
        isOptionAnswer
          ? []
          : [
              <CheckboxWithTipsField
                name="questionOutputs.extra_output"
                defaultValue={false}
                text={I18n.t(
                  'workflow_ques_ans_type_direct_checkbox',
                  {},
                  '从回复中提取字段',
                )}
                itemTooltip={I18n.t(
                  'workflow_ques_ans_type_direct_checkbox_tooltips',
                  {},
                  '开启后将从用户输入中提取信息',
                )}
              />,
            ]
      }
    >
      {isOptionAnswer ? (
        <OutputsDisplayField
          id={'question-node-option-output'}
          name={'questionOutputs.optionOutput'}
          defaultValue={DEFAULT_ANSWER_OPTION_OUTPUT}
        />
      ) : (
        <>
          <OutputsField
            title=""
            id={'question-node-user-output'}
            name={'questionOutputs.userOutput'}
            noCard
            jsonImport={false}
            disabled={true}
            allowAppendRootData={false}
            topLevelReadonly
            withRequired
            hasFeedback={false}
          />
          {extraOutput ? (
            <>
              <QuestionLimit />
              <OutputsField
                title=""
                id={'question-node-extract-output'}
                name={'questionOutputs.extractOutput'}
                defaultValue={DEFAULT_EXTRACT_OUTPUT}
                hiddenTypes={[
                  ...FILE_TYPES,
                  ViewVariableType.ArrayBoolean,
                  ViewVariableType.ArrayInteger,
                  ViewVariableType.ArrayNumber,
                  ViewVariableType.ArrayObject,
                  ViewVariableType.ArrayString,
                  ViewVariableType.Object,
                ]}
                noCard
                withRequired
                jsonImport={false}
                hasFeedback={false}
              />
            </>
          ) : null}
        </>
      )}
    </Section>
  );
};
