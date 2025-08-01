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

import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';
import { type IFormSchema } from '@coze-workflow/test-run-next';

import { generateParametersToProperties } from '@/test-run-kit';
import { type NodeTestMeta } from '@/test-run-kit';
import { AnswerType, OptionType } from '@/constants/question-settings';

export const test: NodeTestMeta = {
  generateFormInputProperties(node) {
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const inputParameters = formData?.inputParameters;

    const inputProperties = generateParametersToProperties(inputParameters, {
      node,
    });
    const answerType = formData?.questionParams?.answer_type;
    const optionType = formData?.questionParams?.option_type;
    let dynamicProperties: IFormSchema['properties'] = {};
    if (answerType === AnswerType.Option && optionType === OptionType.Dynamic) {
      const dynamicOption = formData?.questionParams?.dynamic_option;
      dynamicProperties = generateParametersToProperties(
        [
          {
            name: 'dynamic_option',
            input: dynamicOption,
          },
        ],
        { node },
      );
    }

    return {
      ...inputProperties,
      ...dynamicProperties,
    };
  },
};
