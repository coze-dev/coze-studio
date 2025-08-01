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

import { useUpdateEffect, usePrevious } from 'ahooks';

import { withNodeConfigForm } from '@/node-registries/common/hocs';
import {
  OutputsField,
  InputsParametersField,
} from '@/node-registries/common/fields';
import { useFieldValidate, useForm } from '@/form';

import { type FormData } from './types';
import { ModelSettingField, ReferencesField, PromptField } from './components';

export const FormRender = withNodeConfigForm(() => {
  const validateModel = useFieldValidate('inputs.modelSetting.model');

  useReferenceModelChangeEffect(validateModel);

  return (
    <>
      <ModelSettingField name="inputs.modelSetting" />
      <ReferencesField name="inputs.references" />
      <InputsParametersField name="inputs.inputParameters" />
      <PromptField name="inputs.prompt" />
      <OutputsField name="outputs" readonly={true} />
    </>
  );
});

// Listening to referenced model changes triggers model validation for model settings
// With useWatch, you can't currently listen to the reference model. Instead, listen to the entire form value first
function useReferenceModelChangeEffect(callback: () => void) {
  const form = useForm<FormData>();
  const { values } = form;
  const previousReferences = usePrevious(values?.inputs?.references);

  useUpdateEffect(() => {
    const currentPreprocessors = values?.inputs?.references?.map(
      reference => reference.preprocessor,
    );
    const previousPreprocessors = previousReferences?.map(
      reference => reference.preprocessor,
    );

    const isSamePreprocessors =
      currentPreprocessors?.length === previousPreprocessors?.length &&
      currentPreprocessors?.every(
        (preprocessor, index) =>
          preprocessor === previousPreprocessors?.[index],
      );

    if (!isSamePreprocessors) {
      callback();
    }
  }, [values]);
}
