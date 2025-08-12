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

import classNames from 'classnames';
import {
  FieldArray,
  type FieldArrayRenderProps,
} from '@flowgram-adapter/free-layout-editor';
import {
  type ViewVariableType,
  type InputTypeValueVO,
} from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import InputLabel from '@/nodes-v2/components/input-label';
import { DataTypeTag } from '@/node-registries/common/components';
import { ColumnsTitleWithAction } from '@/form-extensions/components/columns-title-with-action';
import type { Column } from '@/form-extensions/components/columns-title';
import { FieldArrayItem, FieldRows, FieldEmpty, type FieldProps } from '@/form';

import { ValueExpressionInputField } from '../value-expression-input';
import { NodeInputNameField as InputNameField } from '../inputs-parameters-field/node-input-name';

import styles from './index.module.less';

interface ParametersInputGroupFieldProps
  extends FieldProps<InputTypeValueVO[]> {
  name: string;
  columns?: Column[];
  nameReadonly?: boolean;
  fieldEditable?: boolean;
  hiddenRemove?: boolean;
  hiddenTypes?: boolean;
  hiddenTypeTag?: boolean;
  /**
   * Text box default type, but does not restrict optional variable types
   */
  inputType?: ViewVariableType;
  disabledTypes?: ViewVariableType[];
}

export const ParametersInputGroupField = ({
  name,
  columns,
  nameReadonly,
  fieldEditable,
  hiddenRemove,
  hiddenTypeTag = false,
  defaultValue,
  inputType,
  disabledTypes,
}: ParametersInputGroupFieldProps) => {
  const readonly = useReadonly();
  return (
    <FieldArray<InputTypeValueVO> name={name} defaultValue={defaultValue}>
      {({ field }: FieldArrayRenderProps<InputTypeValueVO>) => {
        const { value = [], delete: remove } = field;
        return (
          <FieldEmpty
            isEmpty={!value || value?.length === 0}
            text={I18n.t('workflow_inputs_empty')}
          >
            {columns?.length ? (
              <ColumnsTitleWithAction
                columns={columns}
                readonly={readonly}
                className={classNames(
                  'mb-[8px]',
                  readonly
                    ? styles.parametersTitleReadonly
                    : styles.parametersTitle,
                )}
              />
            ) : null}
            <FieldRows>
              {field.map((item, index) => (
                <FieldArrayItem
                  key={item.key}
                  onRemove={() => remove(index)}
                  disableRemove={!fieldEditable}
                  hiddenRemove={hiddenRemove}
                >
                  <div
                    className="leading-[24px]"
                    style={{
                      flex: 2,
                    }}
                  >
                    {nameReadonly ? (
                      <>
                        <InputLabel label={item.value.name} />
                        {!hiddenTypeTag && (
                          <DataTypeTag type={item.value.type} />
                        )}
                      </>
                    ) : (
                      <InputNameField
                        name={`${item.name}.name`}
                        placeholder={I18n.t(
                          'workflow_detail_node_input_entername',
                        )}
                        input={item.value.input}
                        inputParameters={value}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      flex: 3,
                    }}
                  >
                    <ValueExpressionInputField
                      name={`${item.name}.input`}
                      deps={[`${item.name}.type`]}
                      inputType={inputType}
                      key={item.value.type}
                      disabledTypes={disabledTypes}
                    />
                  </div>
                </FieldArrayItem>
              ))}
            </FieldRows>
          </FieldEmpty>
        );
      }}
    </FieldArray>
  );
};
