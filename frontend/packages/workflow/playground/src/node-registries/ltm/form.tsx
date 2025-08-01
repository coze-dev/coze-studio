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

import { ViewVariableType } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { NodeConfigForm } from '@/node-registries/common/components';

import { OutputsField } from '../common/fields';
import { INPUT_PATH } from './constants';
import { Inputs } from './components';

export const FormRender = () => (
  <NodeConfigForm>
    <div className="relative">
      <Inputs
        name={INPUT_PATH}
        inputType={ViewVariableType.String}
        disabledTypes={ViewVariableType.getComplement([
          ViewVariableType.String,
        ])}
        defaultValue={[{ name: 'Query' }]}
      />
    </div>

    <OutputsField
      title={I18n.t('workflow_detail_node_output')}
      tooltip={I18n.t('ltm_240826_02')}
      id="ltm-node-outputs"
      name="outputs"
      topLevelReadonly={true}
      customReadonly
    />
  </NodeConfigForm>
);
