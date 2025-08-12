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

/**
 * Intent to identify nodes, option component rendering
 */

import { INTENT_NODE_MODE } from '@coze-workflow/nodes';
import { useWorkflowNode } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { calcPortId } from '@/form-extensions/setters/answer-option/utils';

import { AnswerItem } from './question-pairs-answer';
import { Port } from './port';
import { Field } from './field';

export function Intents() {
  const { data } = useWorkflowNode();
  const intents =
    data?.intentMode === INTENT_NODE_MODE.MINIMAL
      ? data?.quickIntents
      : data?.intents;

  return (
    <>
      <div className="mt-[20px]" />
      <div className="mt-[20px]" />
      {intents?.map((intent: { name: string }, index: number) => (
        <Field
          key={index}
          label={I18n.t('workflow_ques_ans_type_option_title')}
        >
          <AnswerItem
            key={intent?.name + index}
            showLabel={false}
            label=""
            content={intent?.name}
            maxWidth={260}
          />
          <Port id={calcPortId(index)} type="output" />
        </Field>
      ))}

      <Field label={I18n.t('workflow_ques_ans_type_option_other')}>
        <Port id="default" type="output" />
      </Field>
    </>
  );
}
