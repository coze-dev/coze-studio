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
import { I18n, type I18nKeysNoOptionsType } from '@coze-arch/i18n';

import { generateArrayInputParameters } from './generate-test-form-fields';

/**
 * Generate image generation Single node practice running form fields
 */
export function generateImageflowGenerateTestFormFields(formData, context) {
  const references =
    get(formData, 'references') || get(formData, 'inputs.references');

  const originParameters =
    get(formData, 'inputParameters') ||
    get(formData, 'inputs.inputParameters') ||
    [];

  const referencesInputParameters =
    referencesToArrayInputParameters(references) || [];

  const inputParameters = [...originParameters, ...referencesInputParameters];

  const fields = generateArrayInputParameters(inputParameters, context);

  return fields;
}

function referencesToArrayInputParameters(references) {
  return references
    ?.filter(({ preprocessor }) => preprocessor)
    ?.map(({ preprocessor, url }) => ({
      name: `__image_references_${preprocessor}`,
      label: I18n.t(
        `Imageflow_reference${preprocessor}` as I18nKeysNoOptionsType,
      ),
      input: url,
    }));
}
