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
  generateEnvToRelatedContextProperties,
} from '@/test-run-kit';
import { type NodeTestMeta } from '@/test-run-kit';

export const test: NodeTestMeta = {
  generateRelatedContext(_, context) {
    const { isInProject } = context;
    if (isInProject) {
      return {};
    }
    return generateEnvToRelatedContextProperties({
      isNeedBot: true,
      hasLTMNode: true,
      disableProject: true,
      disableProjectTooltip: I18n.t('wf_chatflow_142'),
    });
  },
  generateFormInputProperties(node) {
    const formData = node
      .getData(FlowNodeFormData)
      .formModel.getFormItemValueByPath('/');
    const inputParameters = formData?.inputs.inputParameters;

    return generateParametersToProperties(inputParameters, { node });
  },
};
