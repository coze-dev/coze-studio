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

import { useEffect, useMemo } from 'react';

import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import {
  WorkflowNodePortsData,
  useCurrentEntity,
} from '@flowgram-adapter/free-layout-editor';

import { AnswerType, OptionType } from '@/constants/question-settings';

import { VariableTagList } from './variable-tag-list';
import { useInputParametersVariableTags } from './use-input-parameters-variable-tags';
import { AnswerItem } from './question-pairs-answer';
import { Port } from './port';
import { LabelWithTooltip } from './label-with-tooltip';
import { Field } from './field';

import styles from './question-pairs.module.less';

const NumToCharIndex = 65;

const convertNumberToLetters = (n: number) => {
  let result = '';
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + NumToCharIndex) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
};

export function QuestionPairs() {
  const { data } = useWorkflowNode();
  const node = useCurrentEntity();
  const questionParams = data?.questionParams;
  const isOptions = useMemo(
    () => questionParams?.answer_type === AnswerType.Option,
    [questionParams?.answer_type],
  );

  const isDynamic = useMemo(
    () => questionParams?.option_type === OptionType.Dynamic,
    [questionParams?.option_type],
  );

  const dynamicOption = useMemo(
    () => questionParams?.dynamic_option,
    [questionParams?.dynamic_option],
  );

  const dynamicOptionTag = useInputParametersVariableTags([
    {
      name: I18n.t('workflow_question_dynamic', {}, 'dynamicOption'),
      input: dynamicOption,
    },
  ]);

  useEffect(() => {
    const portsData = node.getData<WorkflowNodePortsData>(
      WorkflowNodePortsData,
    );
    portsData.updateDynamicPorts();
  }, [isDynamic]);

  return (
    <>
      <Field
        label={I18n.t('workflow_ques_content', {}, '提问内容')}
        isEmpty={!questionParams?.question}
      >
        <LabelWithTooltip
          customClassName={styles.question_pairs_content}
          maxWidth={230}
          content={questionParams?.question ?? ''}
        />
      </Field>
      <Field label={I18n.t('workflow_240919_02', {}, '问答类型')}>
        <div className={styles.question_pairs_content}>
          {isOptions
            ? I18n.t('workflow_ques_ans_type_option', {}, '选项回答')
            : I18n.t('workflow_ques_ans_type_direct', {}, '直接回答')}
        </div>
      </Field>
      {isOptions ? (
        <>
          {isDynamic ? (
            <Field label={''}>
              <AnswerItem
                label={I18n.t('workflow_question_az', {}, 'A~Z')}
                content={<VariableTagList value={dynamicOptionTag} />}
              />
              <Port id={'branch_0'} type="output" />
            </Field>
          ) : (
            questionParams?.options?.map((option, index) => (
              <Field label={''}>
                <AnswerItem
                  label={convertNumberToLetters(index)}
                  content={option?.name}
                />
                {/* Corresponding questionNodeRegistry options table entry */}
                <Port id={`branch_${index}`} type="output" />
              </Field>
            ))
          )}
          <Field label={''}>
            <AnswerItem
              label={I18n.t('workflow_ques_ans_type_option_other', {}, '其他')}
              content={I18n.t('workflow_240919_03', {}, '用户不可见')}
            />
            <Port id={'default'} type="output" />
          </Field>
        </>
      ) : null}
    </>
  );
}
