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

import React, { type PropsWithChildren } from 'react';

import { generateInputJsonSchema } from '@coze-workflow/variable';
import {
  getInputType,
  getSortedInputParameters,
  type ApiNodeDetailDTO,
} from '@coze-workflow/nodes';
import {
  useNodeTestId,
  type InputValueVO,
  type VariableMetaDTO,
  type DTODefine,
} from '@coze-workflow/base';
import { reporter } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';

import { ValueExpressionInputField } from '@/node-registries/common/fields';
import {
  Section,
  useField,
  ColumnTitles,
  withField,
  SelectField,
  SliderField,
  FieldLayout,
} from '@/form';

import { getCustomSetterProps } from '../../utils';
import { COLUMNS } from './constants';

interface InputsProps {
  inputsDef: ApiNodeDetailDTO['inputs'];
}

const CUSTOM_SETTER_MAP = {
  Select: SelectField,
  Slider: SliderField,
};

const CUSTOM_SETTER_STYLE = {
  Select: {
    width: '100%',
  },
};

const renderCustomSetter = (
  fieldDef: ApiNodeDetailDTO['inputs'][number],
  customSetterProps: Record<string, unknown> & { key: string },
  fieldName: string,
) => {
  const { title, name, required, description, label } = fieldDef;
  const { key, ...setterProps } = customSetterProps;
  const CustomSetter = CUSTOM_SETTER_MAP[key];

  if (!CustomSetter) {
    return null;
  }

  return (
    <FieldLayout
      label={title || label || name}
      tooltip={description}
      required={required}
    >
      <CustomSetter
        {...setterProps}
        name={`${fieldName}.${name}`}
        style={CUSTOM_SETTER_STYLE[key]}
      />
    </FieldLayout>
  );
};

export const InputsKVField = withField(
  ({ inputsDef }: InputsProps & PropsWithChildren) => {
    const { name: fieldName } = useField<InputValueVO>();
    const { getNodeSetterId } = useNodeTestId();

    return (
      <Section
        title={I18n.t('workflow_detail_node_input')}
        tooltip={I18n.t('workflow_detail_api_input_tooltip')}
        testId={getNodeSetterId(fieldName)}
        actions={[]}
      >
        <ColumnTitles columns={COLUMNS} />

        <div className="flex flex-col gap-[8px]">
          {getSortedInputParameters(inputsDef)?.map(fieldDef => {
            const { title, name, required, description, label } = fieldDef;

            const { inputType, disabledTypes } = getInputType(
              fieldDef as DTODefine.InputVariableDTO,
            );

            let jsonSchema: ReturnType<typeof generateInputJsonSchema>;
            try {
              jsonSchema = generateInputJsonSchema(fieldDef as VariableMetaDTO);
            } catch (error) {
              jsonSchema = undefined;
              reporter.error({
                message: 'workflow_plugin_generate_input_json_schema_error',
                error,
              });
            }

            const customSetterProps = getCustomSetterProps(fieldDef);
            if (customSetterProps?.key) {
              return renderCustomSetter(fieldDef, customSetterProps, fieldName);
            }

            return (
              <ValueExpressionInputField
                key={`${fieldName}.${name}`}
                label={title || label || name}
                tooltip={description}
                required={required}
                inputType={inputType}
                disabledTypes={disabledTypes}
                name={`${fieldName}.${name}`}
                literalConfig={jsonSchema ? { jsonSchema } : undefined}
              />
            );
          })}
        </div>
      </Section>
    );
  },
);
