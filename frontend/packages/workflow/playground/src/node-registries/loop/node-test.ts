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
import { FlowNodeFormData } from '@flowgram-adapter/free-layout-editor';

import {
  generateParametersToProperties,
  getRelatedInfo,
  generateEnvToRelatedContextProperties,
} from '@/test-run-kit';
import { type NodeTestMeta } from '@/test-run-kit';

import { LoopType } from './constants';

export const test: NodeTestMeta = {
  async generateRelatedContext(_, context) {
    const { isInProject, workflowId, spaceId } = context;
    if (isInProject) {
      return {};
    }
    const related = await getRelatedInfo({ workflowId, spaceId });
    return generateEnvToRelatedContextProperties(related);
  },
  generateFormSettingProperties(node) {
    const { formModel } = node.getData(FlowNodeFormData);
    const data = formModel.getFormItemValueByPath('/inputs');
    if (data?.loopType === LoopType.Count && data?.loopCount) {
      return generateParametersToProperties(
        [
          {
            name: 'loopCount',
            title: I18n.t('workflow_loop_count'),
            /** Cycle count is required */
            required: true,
            input: data.loopCount,
          },
        ],
        { node },
      );
    }
    return {};
  },
  generateFormInputProperties(node) {
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const parameters = formData?.inputs?.inputParameters;
    const variable = formData?.inputs?.variableParameters;
    const properties = {
      // Input when specifying the number of cycles
      ...(formData?.inputs?.loopType === LoopType.Array
        ? generateParametersToProperties(parameters, { node })
        : {}),
      /** intermediate variable */
      ...generateParametersToProperties(variable, { node }),
    };
    return properties;
  },
};
