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

import capitalize from 'lodash-es/capitalize';
import classnames from 'classnames';
import {
  Field,
  type FieldRenderProps,
} from '@flowgram-adapter/free-layout-editor';
import { ViewVariableType, type ValueExpression } from '@coze-workflow/base';

import { ValueExpressionInput } from '@/nodes-v2/components/value-expression-input';
import InputLabel from '@/nodes-v2/components/input-label';
import { FormItemFeedback } from '@/nodes-v2/components/form-item-feedback';
import { VariableTypeTag } from '@/form-extensions/components/variable-type-tag';

export interface FixedInputParametersProps {
  fieldConfig: {
    label: string;
    description: string;
    name: string;
    required: boolean;
    type: ViewVariableType;
  }[];
  name: string;
  layout?: 'horizontal' | 'vertical';
  showColumnHeader?: boolean;
  refDisabled?: boolean;
  onChange?: () => void;
  inputPlaceholder?: string;
}

export const FixedInputParameter = (props: FixedInputParametersProps) => {
  const {
    fieldConfig = [],
    name: parentName,
    layout = 'vertical',
    refDisabled = false,
    onChange,
    inputPlaceholder,
  } = props;

  return (
    <>
      {fieldConfig.map(_field => (
        <div
          key={`${_field.name}`}
          className={classnames({
            'flex flex-row': layout === 'horizontal',
          })}
        >
          <div className={'w-full h-[20px] leading-[20px] mb-[4px]'}>
            <InputLabel
              required={_field?.required}
              label={_field?.label}
              className="!items-center"
              tooltip={_field?.description}
              tootipIconClassName="coz-fg-secondary"
              tag={
                _field?.type ? (
                  <VariableTypeTag className="!inline-flex" size="xs">
                    {capitalize(ViewVariableType.getLabel(_field.type))}
                  </VariableTypeTag>
                ) : null
              }
            />
          </div>

          <Field name={`${parentName}.${_field?.name}`}>
            {({
              field: childField,
              fieldState: childState,
            }: FieldRenderProps<ValueExpression | undefined>) => (
              <div className="w-full">
                <ValueExpressionInput
                  {...childField}
                  onChange={(...args) => {
                    childField.onChange(...args);
                    onChange?.();
                  }}
                  inputPlaceholder={inputPlaceholder}
                  refDisabled={refDisabled}
                  inputType={_field.type}
                  disabledTypes={ViewVariableType.getComplement([_field.type])}
                  isError={!!childState?.errors?.length}
                />
                <FormItemFeedback errors={childState?.errors} />
              </div>
            )}
          </Field>
        </div>
      ))}
    </>
  );
};
