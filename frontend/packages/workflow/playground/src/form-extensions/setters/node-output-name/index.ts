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
import { type SetterExtension } from '@flowgram-adapter/free-layout-editor';

import { nameValidationRule } from '../helper';
import { NodeOutputName } from './node-output-name';
interface PartialOutputParameter {
  name: string | undefined;
}

export const nodeOutputName: SetterExtension = {
  key: 'NodeOutputName',
  component: NodeOutputName,
  validator: ({ value, context }) => {
    const { node } = context;

    /** name check */
    if (!nameValidationRule.test(value)) {
      return I18n.t('workflow_detail_node_error_format');
    }

    const outputsPath = node.getNodeMeta()?.outputsPath;

    if (!outputsPath) {
      return;
    }

    const nodeInputParameters =
      context.getFormItemValueByPath<PartialOutputParameter[]>(outputsPath) ||
      [];

    const foundSame = nodeInputParameters.filter(
      (input: PartialOutputParameter) => input.name === value,
    );

    return foundSame?.length > 1
      ? I18n.t('workflow_detail_node_error_name_duplicated', {
          name: value,
        })
      : undefined;
  },
};
