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

import Ajv from 'ajv';
import { I18n } from '@coze-arch/i18n';

import { type FormItemSchema } from '../../types';
import { FormItemSchemaType } from '../../constants';

export enum VariableTypeDTO {
  object = 'object',
  list = 'list',
  string = 'string',
  integer = 'integer',
  float = 'float',
  number = 'number',
  boolean = 'boolean',
}

const VariableType2JsonSchemaProps = {
  [VariableTypeDTO.object]: { type: 'object' },
  [VariableTypeDTO.list]: { type: 'array' },
  [VariableTypeDTO.float]: { type: 'number' },
  [VariableTypeDTO.number]: { type: 'number' },
  [VariableTypeDTO.integer]: { type: 'integer' },
  [VariableTypeDTO.boolean]: { type: 'boolean' },
  [VariableTypeDTO.string]: { type: 'string' },
};

function validateByJsonSchema(val: any, jsonSchema: any) {
  if (!jsonSchema || !val) {
    return true;
  }

  const ajv = new Ajv();

  try {
    const validate = ajv.compile(jsonSchema);
    const valid = validate(JSON.parse(val));

    return valid;
    // eslint-disable-next-line @coze-arch/use-error-in-catch -- no-catch
  } catch {
    return false;
  }
}
function workflowJsonToJsonSchema(workflowJson: any) {
  const { type, description } = workflowJson;
  const props = VariableType2JsonSchemaProps[type];
  if (type === VariableTypeDTO.object) {
    const properties = {};
    const required: string[] = [];
    for (const field of workflowJson.schema) {
      properties[field.name] = workflowJsonToJsonSchema(field);
      if (field.required) {
        required.push(field.name);
      }
    }
    return {
      ...props,
      description,
      required,
      properties,
    };
  } else if (type === VariableTypeDTO.list) {
    return {
      ...props,
      description,
      items: workflowJsonToJsonSchema(workflowJson.schema),
    };
  }
  return { ...props, description };
}

/**
 * Customize the form's additional parameters
 * Currently only jsonSchema validation is applied to array and object forms
 */
export function getTestsetFormItemCustomProps(
  formItemSchema: FormItemSchema,
  projectId?: string,
) {
  switch (formItemSchema.type) {
    case FormItemSchemaType.CHAT:
      return {
        projectId,
      };
    case FormItemSchemaType.LIST:
    case FormItemSchemaType.OBJECT: {
      const jsonSchema = workflowJsonToJsonSchema(formItemSchema);

      return {
        trigger: ['blur'],
        jsonSchema,
        rules: [
          {
            validator: (_rules, v, cb) => {
              if (formItemSchema.required && !v) {
                cb(
                  I18n.t('workflow_testset_required_tip', {
                    param_name: formItemSchema.name,
                  }),
                );
                return false;
              }

              if (!validateByJsonSchema(v, jsonSchema)) {
                cb(I18n.t('workflow_debug_wrong_json'));
                return false;
              }

              return true;
            },
          },
        ] as any[],
      };
    }
    default:
      return {};
  }
}
