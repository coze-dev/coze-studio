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

import { useNodeTestId, type InputValueVO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { withNodeConfigForm } from '@/node-registries/common/hocs';
import { useWatch } from '@/form';

import { InputsParametersField, AnswerContentField } from '../common/fields';
import { TerminatePlan } from './types';
import {
  INPUT_PATH,
  TERMINATE_PLAN_PATH,
  ANSWER_CONTENT_PATH,
  STREAMING_OUTPUT_PATH,
} from './constants';
import { TerminatePlanField } from './components/terminate-plan-field';

export const FormRender = withNodeConfigForm(() => {
  const terminatePlan = useWatch<TerminatePlan>(TERMINATE_PLAN_PATH);
  const inputParameters = useWatch<InputValueVO[]>(INPUT_PATH);

  const { getNodeSetterId } = useNodeTestId();
  const setterTestId = getNodeSetterId('');
  return (
    <>
      <TerminatePlanField />
      <InputsParametersField
        name={INPUT_PATH}
        title={I18n.t('workflow_detail_end_output')}
        tooltip={I18n.t('workflow_detail_end_output_tooltip')}
        isTree={true}
        testId={setterTestId}
      />
      {terminatePlan === TerminatePlan.UseAnswerContent ? (
        <AnswerContentField
          editorFieldName={ANSWER_CONTENT_PATH}
          switchFieldName={STREAMING_OUTPUT_PATH}
          title={I18n.t('workflow_detail_end_answer')}
          tooltip={I18n.t('workflow_detail_end_answer_tooltip')}
          enableStreamingOutput
          switchLabel={I18n.t('workflow_message_streaming_name')}
          switchTooltip={I18n.t('workflow_message_streaming_tooltips')}
          // Adapt to the old testId format
          testId={`/${ANSWER_CONTENT_PATH.split('.').join('/')}`}
          switchTestId={STREAMING_OUTPUT_PATH.split('.')?.at(-1)}
          inputParameters={inputParameters}
        />
      ) : null}
    </>
  );
});
