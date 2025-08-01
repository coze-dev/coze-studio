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

import { I18n } from '@coze-arch/i18n';

import { NodeConfigForm } from '@/node-registries/common/components';
import { Section } from '@/form';
import { AnswerType } from '@/constants/question-settings';

import {
  ModelSelectField,
  InputsParametersField,
  ExpressionEditorField,
  RadioSetterField,
} from '../common/fields';
import { QuestionOutputs } from './components/question-outputs';
import { AnswerOptionField } from './components/answer-option-field';

const Render = () => (
  <NodeConfigForm>
    <ModelSelectField
      name="llmParam"
      title={I18n.t('workflow_detail_llm_model')}
    />
    <InputsParametersField
      name="inputParameters"
      tooltip={I18n.t(
        'workflow_ques_input_tooltips',
        {},
        '输入需要添加到问题的参数,这些参数可以被下方的问题引用',
      )}
    />
    <Section
      title={I18n.t('workflow_ques_content', {}, '提问内容')}
      tooltip={I18n.t(
        'workflow_ques_content_tooltips',
        {},
        '用于对用户发出提问的具体内容描述',
      )}
    >
      <div className="w-full mb-[12px]">
        <ExpressionEditorField
          name="questionParams.question"
          dataTestName="/questionParams/question"
          placeholder={I18n.t('workflow_ques_content_placeholder')}
          className="!p-[4px]"
          containerClassName="!bg-transparent"
        />
      </div>
      <Section
        headerClassName="!mb-0"
        title={
          <div className="text-xs font-normal">
            {I18n.t('workflow_ques_ans_type', {}, '请选择回答类型')}
          </div>
        }
        noPadding
        collapsible={false}
      >
        <RadioSetterField
          name="questionParams.answer_type"
          defaultValue={AnswerType.Text}
          options={{
            key: 'questionParams.answer_type',
            mode: 'card',
            direction: 'vertical',
            customClassName: 'pt-[4px] gap-y-[4px]',
            options: [
              {
                value: AnswerType.Text,
                label: I18n.t('workflow_ques_ans_type_direct', {}, '直接回答'),
              },
              {
                value: AnswerType.Option,
                label: I18n.t('workflow_ques_ans_type_option', {}, '选项回答'),
              },
            ],
          }}
        />
      </Section>
      <AnswerOptionField
        name="questionParams.options"
        optionPlaceholder={I18n.t(
          'workflow_ans_content_placeholder',
          {},
          '可以使用{{变量名}}引入输入参数中的变量',
        )}
        defaultOptionText={I18n.t(
          'workflow_ques_ans_type_option_other_placeholder',
          {},
          '此选项对用户不可见，当用户回复无关内容时，走此分支',
        )}
      />
    </Section>
    <QuestionOutputs />
  </NodeConfigForm>
);

export default Render;
