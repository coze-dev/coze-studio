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

import { type InputValueVO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { withNodeConfigForm } from '@/node-registries/common/hocs';
import { useWatch } from '@/form';

import { InputsParametersField, AnswerContentField } from '../common/fields';
import {
  INPUT_PATH,
  ANSWER_CONTENT_PATH,
  STREAMING_OUTPUT_PATH,
} from './constants';

export const FormRender = withNodeConfigForm(() => {
  const inputParameters = useWatch<InputValueVO[]>(INPUT_PATH);
  return (
    <>
      <InputsParametersField
        key={INPUT_PATH}
        name={INPUT_PATH}
        title={I18n.t('workflow_detail_end_output')}
        tooltip={I18n.t('workflow_message_variable_tooltips')}
        isTree={true}
      />
      <AnswerContentField
        key={ANSWER_CONTENT_PATH}
        editorFieldName={ANSWER_CONTENT_PATH}
        switchFieldName={STREAMING_OUTPUT_PATH}
        title={I18n.t('workflow_241111_01')}
        tooltip={I18n.t('workflow_message_anwser_tooltips')}
        enableStreamingOutput
        switchLabel={I18n.t('workflow_message_streaming_name')}
        switchTooltip={I18n.t('workflow_message_streaming_tooltips')}
        // Adapt to the old testId format
        testId={`/${ANSWER_CONTENT_PATH.split('.').join('/')}`}
        switchTestId={STREAMING_OUTPUT_PATH.split('.')?.at(-1)}
        inputParameters={inputParameters}
      />
    </>
  );
});
