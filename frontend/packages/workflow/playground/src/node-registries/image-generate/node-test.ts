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

import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';

import { generateParametersToProperties } from '@/test-run-kit';
import { type NodeTestMeta } from '@/test-run-kit';

export const test: NodeTestMeta = {
  generateFormInputProperties(node) {
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const inputParameters =
      formData?.inputParameters || formData?.inputs.inputParameters || [];
    const references = (
      formData?.references ||
      formData?.inputs?.references ||
      []
    )
      .filter(item => item.preprocessor)
      .map(item => ({
        name: `__image_references_${item.preprocessor}`,
        title: I18n.t(
          `Imageflow_reference${item.preprocessor}` as I18nKeysNoOptionsType,
        ),
        input: item.url,
      }));

    return {
      ...generateParametersToProperties(references, { node }),
      ...generateParametersToProperties(inputParameters, { node }),
    };
  },
};
