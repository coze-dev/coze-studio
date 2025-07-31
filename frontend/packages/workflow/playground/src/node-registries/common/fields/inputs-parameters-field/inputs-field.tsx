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

import {
  FieldArray,
  type FieldArrayRenderProps,
} from '@flowgram-adapter/free-layout-editor';
import type { ViewVariableType, InputValueVO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { ColumnsTitleWithAction } from '@/form-extensions/components/columns-title-with-action';
import {
  AddButton,
  FieldArrayItem,
  FieldRows,
  Section,
  type FieldProps,
} from '@/form';

import {
  ValueExpressionInputField,
  type ValueExpressionInputProps,
} from '../value-expression-input';
import { type NodeInputNameProps } from './node-input-name/type';
import { NodeInputNameField } from './node-input-name';

interface InputsFieldProps extends FieldProps<InputValueVO[]> {
  title?: string;
  paramsTitle?: string;
  expressionTitle?: string;
  disabledTypes?: ViewVariableType[];
  onAppend?: () => InputValueVO;
  inputPlaceholder?: string;
  literalDisabled?: boolean;
  showEmptyText?: boolean;
  nthCannotDeleted?: number;
  nameProps?: Partial<NodeInputNameProps>;
  inputProps?: ValueExpressionInputProps;
  customReadonly?: boolean;
  testId?: string;
}

export const InputsField = ({
  name,
  defaultValue,
  title,
  tooltip,
  paramsTitle,
  expressionTitle,
  disabledTypes,
  inputPlaceholder,
  literalDisabled,
  onAppend,
  nthCannotDeleted,
  showEmptyText = true,
  nameProps = {},
  inputProps = {},
  customReadonly,
  testId,
}: InputsFieldProps) => {
  const formReadonly = useReadonly();
  const readonly = formReadonly || customReadonly;
  return (
    <FieldArray<InputValueVO> name={name} defaultValue={defaultValue}>
      {({ field }: FieldArrayRenderProps<InputValueVO>) => {
        const { value = [], delete: remove, append } = field;
        const length = value?.length ?? 0;
        const isEmpty = !length;
        const disableRemove = nthCannotDeleted === length;
        return (
          <Section
            title={title}
            tooltip={tooltip}
            actions={
              !readonly
                ? [
                    <AddButton
                      dataTestId={`${testId}.add-button`}
                      onClick={() => {
                        const newValue = (onAppend?.() ?? {
                          name: '',
                        }) as InputValueVO;
                        append(newValue);
                      }}
                    />,
                  ]
                : []
            }
            isEmpty={showEmptyText && isEmpty}
            emptyText={I18n.t('workflow_inputs_empty')}
          >
            <ColumnsTitleWithAction
              columns={[
                {
                  title:
                    paramsTitle ??
                    I18n.t('workflow_detail_node_parameter_name'),
                  style: { flex: 2 },
                },
                {
                  title:
                    expressionTitle ??
                    I18n.t('workflow_detail_end_output_value'),
                  style: { flex: 3 },
                },
              ]}
              readonly={readonly}
              className="mb-[8px]"
              style={{
                display: isEmpty ? 'none' : 'flex',
              }}
            />
            <FieldRows>
              {field.map((item, index) => (
                <FieldArrayItem
                  key={item.key}
                  disableRemove={disableRemove}
                  hiddenRemove={readonly}
                  onRemove={() => remove(index)}
                >
                  <div style={{ flex: 2 }}>
                    <NodeInputNameField
                      name={`${item.name}.name`}
                      placeholder={I18n.t(
                        'workflow_detail_node_input_entername',
                      )}
                      input={item.value.input}
                      inputParameters={value}
                      {...nameProps}
                    />
                  </div>
                  <div style={{ flex: 3 }}>
                    <ValueExpressionInputField
                      name={`${name}.${index}.input`}
                      disabledTypes={disabledTypes}
                      inputPlaceholder={inputPlaceholder}
                      literalDisabled={literalDisabled}
                      customReadonly={customReadonly}
                      {...inputProps}
                    />
                  </div>
                </FieldArrayItem>
              ))}
            </FieldRows>
          </Section>
        );
      }}
    </FieldArray>
  );
};
