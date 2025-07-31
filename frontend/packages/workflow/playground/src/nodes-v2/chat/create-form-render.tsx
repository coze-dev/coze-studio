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

import { Field } from '@flowgram-adapter/free-layout-editor';
import { PublicScopeProvider } from '@coze-workflow/variable';
import {
  type InputValueVO,
  type ViewVariableTreeNode,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { Outputs } from '@/nodes-v2/components/outputs';

import NodeMeta from '../components/node-meta';
import FixedInputParameters from '../components/fixed-input-parameters';
import { INPUT_COLUMNS_NARROW } from './constants';
export interface FormRenderProps {
  defaultInputValue: InputValueVO[] | undefined;
  defaultOutputValue: ViewVariableTreeNode[] | undefined;
  fieldConfig: Record<
    string,
    {
      description: string;
      name: string;
      required: boolean;
      type: string;
      optionsList?: {
        label: string;
        value: string;
      }[];
    }
  >;
  readonly: boolean;
  inputTooltip: string;
  outputTooltip: string;
  hasInputs?: boolean;
}

export const createFormRender = ({
  defaultInputValue,
  defaultOutputValue,
  fieldConfig,
  readonly,
  inputTooltip = '',
  outputTooltip = '',
  hasInputs = true,
}: FormRenderProps) => (
  <PublicScopeProvider>
    <>
      <NodeMeta fieldName="nodeMeta" />

      {hasInputs ? (
        <FixedInputParameters
          fieldName="inputParameters"
          defaultValue={defaultInputValue}
          headerTitle={I18n.t('workflow_detail_node_parameter_input')}
          headerTootip={inputTooltip}
          columns={INPUT_COLUMNS_NARROW}
          fieldConfig={fieldConfig}
          readonly={readonly}
        />
      ) : null}

      <Field name="outputs" defaultValue={defaultOutputValue}>
        {({ field, fieldState }) => (
          <Outputs
            id={'create-conversation-node-output'}
            value={field.value}
            onChange={field.onChange}
            titleTooltip={outputTooltip}
            readonly
            needErrorBody={false}
            errors={fieldState?.errors}
          />
        )}
      </Field>
    </>
  </PublicScopeProvider>
);
