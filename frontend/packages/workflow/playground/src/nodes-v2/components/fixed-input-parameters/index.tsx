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
  Field,
  FieldArray,
  type FieldArrayRenderProps,
  type FieldRenderProps,
} from '@flowgram-adapter/free-layout-editor';
import { variableUtils } from '@coze-workflow/variable';
import {
  ViewVariableType,
  type InputValueVO,
  type ValueExpression,
  type VariableTypeDTO,
} from '@coze-workflow/base';

import { ValueExpressionInput } from '@/nodes-v2/components/value-expression-input';
import { FormItemFeedback } from '@/nodes-v2/components/form-item-feedback';
import { FormCard } from '@/form-extensions/components/form-card';
import { ColumnsTitle } from '@/form-extensions/components/columns-title';

import InputLabel from '../input-label';

export interface FixedInputParametersProps {
  fieldName?: string;
  defaultValue?: InputValueVO[];
  headerTitle: string;
  headerTootip: string;
  columns?: {
    title: string;
    style: React.CSSProperties;
  }[];
  fieldConfig?: Record<
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
  readonly?: boolean;
}

const FixedInputParameters = (props: FixedInputParametersProps) => {
  const {
    fieldName = 'inputParameters',
    defaultValue = [],
    headerTitle,
    headerTootip,
    columns,
    fieldConfig = {},
    readonly = false,
  } = props;
  return (
    <FieldArray name={fieldName} defaultValue={defaultValue}>
      {({ field: _field }: FieldArrayRenderProps<InputValueVO>) => (
        <>
          <FormCard header={headerTitle} tooltip={headerTootip}>
            <div className="pb-[8px]">
              <ColumnsTitle columns={columns ?? []} />
            </div>

            {Object.keys(fieldConfig).map((_fieldName, index) => (
              <div
                key={_fieldName}
                className="array-item-wrapper flex items-start pb-[8px]"
              >
                <div className={'w-[140px]'}>
                  <InputLabel
                    required={fieldConfig[_fieldName]?.required}
                    label={fieldConfig[_fieldName]?.name}
                    tooltip={fieldConfig[_fieldName]?.description}
                    tootipIconClassName="coz-fg-secondary"
                    tag={null}
                  />
                </div>

                <Field name={`inputParameters.${index}.input`}>
                  {({
                    field: childField,
                    fieldState: childState,
                  }: FieldRenderProps<ValueExpression | undefined>) => (
                    <div className="flex-1 min-w-0">
                      <ValueExpressionInput
                        {...childField}
                        readonly={readonly}
                        disabledTypes={ViewVariableType.getComplement([
                          variableUtils.DTOTypeToViewType(
                            fieldConfig[_fieldName].type as VariableTypeDTO,
                          ),
                        ])}
                        literalConfig={{
                          // Drop down to select the data source
                          optionsList: fieldConfig[_fieldName]?.optionsList,
                        }}
                        isError={!!childState?.errors?.length}
                      />
                      <FormItemFeedback errors={childState?.errors} />
                    </div>
                  )}
                </Field>
              </div>
            ))}
          </FormCard>
        </>
      )}
    </FieldArray>
  );
};

export default FixedInputParameters;
