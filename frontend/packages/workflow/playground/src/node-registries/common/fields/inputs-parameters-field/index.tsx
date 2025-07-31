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

import { type ViewVariableType, type InputValueVO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { type FieldProps } from '@/form';

import { type NodeInputNameProps } from './node-input-name/type';
import { InputsTreeField } from './inputs-tree-field';
import { InputsField } from './inputs-field';

interface InputsSectionProps extends FieldProps<InputValueVO[]> {
  title?: string;
  tooltip?: React.ReactNode;
  isTree?: boolean;
  paramsTitle?: string;
  expressionTitle?: string;
  testId?: string;
  disabledTypes?: ViewVariableType[];
  onAppend?: () => InputValueVO;
  inputPlaceholder?: string;
  literalDisabled?: boolean;
  nameProps?: Partial<NodeInputNameProps>;
  customReadonly?: boolean;
}

export const InputsParametersField = ({
  name = 'inputs.inputParameters',
  title = I18n.t('workflow_detail_node_parameter_input'),
  tooltip = I18n.t('workflow_240218_07'),
  paramsTitle,
  expressionTitle,
  disabledTypes,
  defaultValue,
  onAppend,
  inputPlaceholder,
  literalDisabled,
  isTree,
  nameProps,
  customReadonly,
  testId,
}: InputsSectionProps) =>
  isTree ? (
    <InputsTreeField
      name={name}
      defaultValue={defaultValue}
      title={title}
      tooltip={tooltip}
      customReadonly={customReadonly}
      testId={testId}
    />
  ) : (
    <InputsField
      name={name}
      defaultValue={defaultValue}
      title={title}
      tooltip={tooltip}
      paramsTitle={paramsTitle}
      expressionTitle={expressionTitle}
      disabledTypes={disabledTypes}
      onAppend={onAppend}
      inputPlaceholder={inputPlaceholder}
      literalDisabled={literalDisabled}
      nameProps={nameProps}
      customReadonly={customReadonly}
      testId={testId}
    />
  );
