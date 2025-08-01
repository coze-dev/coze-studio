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

import { type FC } from 'react';

import { type InputValueVO, useNodeTestId } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { Section } from '@/form';

import { SwitchField } from '../switch-field';
import { ExpressionEditorField } from '../expression-editor-field';
export interface AnswerContentFieldProps {
  enableStreamingOutput?: boolean;
  editorFieldName: string;
  switchFieldName?: string;
  title?: string;
  tooltip?: string;
  switchLabel?: string;
  switchTooltip?: string;
  switchTestId?: string;
  inputParameters?: InputValueVO[];
  testId?: string;
}
export const AnswerContentField: FC<AnswerContentFieldProps> = ({
  title,
  tooltip,
  switchLabel,
  switchTooltip,
  enableStreamingOutput,
  editorFieldName,
  switchFieldName,
  switchTestId,
  inputParameters,
  testId,
}) => {
  const { concatTestId, getNodeSetterId } = useNodeTestId();

  return (
    <Section
      title={title}
      tooltip={tooltip}
      actions={[
        enableStreamingOutput && switchFieldName ? (
          <SwitchField
            name={switchFieldName}
            customLabel={switchLabel}
            customTooltip={switchTooltip}
            testId={concatTestId(testId ?? '', switchTestId ?? '')}
          />
        ) : null,
      ]}
      testId={getNodeSetterId(testId ?? '')}
    >
      <ExpressionEditorField
        name={editorFieldName}
        placeholder={I18n.t('workflow_detail_end_answer_example')}
        inputParameters={inputParameters}
        testId={testId}
      />
    </Section>
  );
};
