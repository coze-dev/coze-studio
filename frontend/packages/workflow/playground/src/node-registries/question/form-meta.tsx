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

import { get } from 'lodash-es';
import { I18n } from '@coze-arch/i18n';
import {
  ValidateTrigger,
  type FormMetaV2,
  DataEvent,
  type EffectOptions,
} from '@flowgram-adapter/free-layout-editor';

import { provideNodeOutputVariablesEffect } from '@/nodes-v2/materials/provide-node-output-variables';
import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import { fireNodeTitleChange } from '@/nodes-v2/materials/fire-node-title-change';
import { createValueExpressionInputValidate } from '@/nodes-v2/materials/create-value-expression-input-validate';
import { createNodeInputNameValidate } from '@/nodes-v2/components/node-input-name/validate';
import { valueExpressionValidator } from '@/form-extensions/validators';
import { OptionType } from '@/constants/question-settings';

import { outputTreeMetaValidator } from '../common/fields/outputs';
import FormRender from './form';
import {
  syncQuestionAnswerTypeEffect,
  syncQuestionOptionTypeEffect,
  syncQuestionOutputsEffect,
} from './effects';
import { transformOnInit, transformOnSubmit } from './data-transformer';

const questionFieldName = 'questionParams.question';
const questionOptionsFieldName = 'questionParams.options.*.name';
const questionDynamicFieldName = 'questionParams.dynamic_option';

export const QUESTION_FORM_META: FormMetaV2<FormData> = {
  // Node form rendering
  render: () => <FormRender />,

  // verification trigger timing
  validateTrigger: ValidateTrigger.onBlur,

  // validation rules
  validate: {
    nodeMeta: nodeMetaValidate,
    'inputParameters.*.name': createNodeInputNameValidate({
      getNames: ({ formValues }) =>
        (get(formValues, 'inputParameters') || []).map(item => item.name),
    }),
    'inputParameters.*.input': createValueExpressionInputValidate({
      required: true,
    }),
    [questionFieldName]: ({ value }) =>
      value
        ? undefined
        : I18n.t('workflow_detail_node_error_empty', {}, '参数值不可为空'),
    [questionOptionsFieldName]: ({ value, formValues }) => {
      const anwserType = get(formValues, 'questionParams.answer_type');
      const optionType = get(formValues, 'questionParams.option_type');
      if (anwserType !== 'option' || optionType !== OptionType.Static) {
        return undefined;
      }
      if (!value) {
        return I18n.t('workflow_ques_option_notempty', {}, '选项内容不可为空');
      }
      const options = get(formValues, 'questionParams.options');

      return options.filter(option => option?.name === value)?.length > 1
        ? I18n.t('workflow_ques_ans_testrun_dulpicate', {}, '选项内容不可重复')
        : undefined;
    },
    [questionDynamicFieldName]: ({ value, formValues, context }) => {
      const { node, playgroundContext } = context;
      const anwserType = get(formValues, 'questionParams.answer_type');
      const optionType = get(formValues, 'questionParams.option_type');

      if (anwserType !== 'option' || optionType !== OptionType.Dynamic) {
        return undefined;
      }
      return valueExpressionValidator({
        value,
        playgroundContext,
        node,
        required: true,
      });
    },
    'questionOutputs.extractOutput': outputTreeMetaValidator,
  },

  // Side effect management
  effect: {
    'questionParams.answer_type': [
      {
        effect: syncQuestionAnswerTypeEffect,
        event: DataEvent.onValueChange,
      },
      {
        effect: syncQuestionAnswerTypeEffect,
        event: DataEvent.onValueInit,
      },
    ] as unknown as EffectOptions[],
    'questionParams.option_type': [
      {
        effect: syncQuestionOptionTypeEffect,
        event: DataEvent.onValueChange,
      },
    ],
    questionOutputs: [
      {
        effect: syncQuestionOutputsEffect,
        event: DataEvent.onValueChange,
      },
    ] as unknown as EffectOptions[],
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,
  },

  // Node Backend Data - > Frontend Form Data
  formatOnInit: transformOnInit,

  // Front-end form data - > node back-end data
  formatOnSubmit: transformOnSubmit,
};
