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

import { ExpressionEditorField } from '@/node-registries/common/components';
import { withField, useField, Section } from '@/form';

export const PromptField = withField(
  () => {
    const { name } = useField();
    const promptName = `${name}.prompt`;
    const negativePromptName = `${name}.negative_prompt`;
    // Guarantee that the testID of the previous node remains unchanged
    const promptTestIDSuffix = name.replace('inputs.', '');
    const negativePromptTestIDSuffix = name.replace('inputs.', '');

    return (
      <Section
        title={I18n.t('Imageflow_prompt')}
        tooltip={I18n.t('imageflow_generation_desc4')}
      >
        <ExpressionEditorField
          name={promptName}
          testIDSuffix={promptTestIDSuffix}
          label={I18n.t('Imageflow_positive')}
          placeholder={I18n.t('Imageflow_positive_placeholder')}
          required={true}
          layout="vertical"
        />
        <ExpressionEditorField
          name={negativePromptName}
          testIDSuffix={negativePromptTestIDSuffix}
          label={I18n.t('Imageflow_negative')}
          placeholder={I18n.t('Imageflow_negative_placeholder')}
          layout="vertical"
        />
      </Section>
    );
  },
  {
    hasFeedback: false,
  },
);
