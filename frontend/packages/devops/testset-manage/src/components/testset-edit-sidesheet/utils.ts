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

/* eslint-disable @typescript-eslint/naming-convention -- copy */
import Ajv from 'ajv';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { type RuleItem } from '@coze-arch/bot-semi/Form';
import {
  type ComponentSubject,
  type BizCtx,
} from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';

import {
  type NodeFormSchema,
  type FormItemSchema,
  type ArrayFieldSchema,
  FormItemSchemaType,
} from '../../types';

let ajv: Ajv | undefined;
/** jsonStr converts to a node form schema (simply'JSON.parse ') */
export function toNodeFormSchemas(jsonStr?: string): NodeFormSchema[] {
  if (!jsonStr) {
    return [];
  }

  try {
    const schemas = JSON.parse(jsonStr) as NodeFormSchema[];
    return schemas;
  } catch (e: any) {
    logger.error(e);
    return [];
  }
}

/** Null value judgment, null/undefined/NaN */
export function isNil(val: unknown) {
  return (
    typeof val === 'undefined' ||
    val === null ||
    (typeof val === 'number' && isNaN(val))
  );
}

function isNumberType(t: string) {
  return t === FormItemSchemaType.NUMBER || t === FormItemSchemaType.FLOAT;
}

/** Determine that the type is consistent, ** specialization: ** 'number' and'float 'are regarded as the same type */
export function isSameType(t1?: string, t2?: string) {
  if (typeof t1 === 'undefined' || typeof t2 === 'undefined') {
    return false;
  }

  return isNumberType(t1) ? isNumberType(t2) : t1 === t2;
}

/** Two layers for traversing schema (often need to traverse, draw a single function) */
export function traverseNodeFormSchemas(
  schemas: NodeFormSchema[],
  cb: (s: NodeFormSchema, ip: FormItemSchema) => any,
) {
  for (const schema of schemas) {
    for (const ipt of schema.inputs) {
      cb(schema, ipt);
    }
  }
}

/**
 * Verification name format (refer to plug-in name)
 * - Overseas: Only support entering letters, numbers, underscores or spaces
 * - Domestic: Only supports entering Chinese, letters, numbers, underscores or spaces
 */
function validateNamePattern(
  name: string,
  isOversea?: boolean,
): string | undefined {
  try {
    const pattern = isOversea ? /^[\w\s]+$/ : /^[\w\s\u4e00-\u9fa5]+$/u;
    const msg = isOversea
      ? I18n.t('create_plugin_modal_nameerror')
      : I18n.t('create_plugin_modal_nameerror_cn');

    return pattern.test(name) ? undefined : msg;
  } catch (e: any) {
    logger.error(e);
    return undefined;
  }
}

interface GetTestsetNameRulesProps {
  /** bizCtx */
  bizCtx?: BizCtx;
  /** bizComponentSubject */
  bizComponentSubject?: ComponentSubject;
  /** raw value */
  originVal?: string;
  /** Whether it is overseas (overseas is not allowed to enter Chinese, it is aligned with the PluginName verification rule) */
  isOversea?: boolean;
}

/**
 * TestSet Name Form Validation Rules
 *
 * @param param.bizCtx - bizCtx
 * @param param.bizComponentSubject - bizComponentSubject
 * @Param param.originVal - original value
 * @Param param.isOverseas - whether it is overseas (overseas is not allowed to enter Chinese, it is aligned with the PluginName verification rule)
 */
export function getTestsetNameRules({
  bizCtx,
  bizComponentSubject,
  originVal,
  isOversea,
}: GetTestsetNameRulesProps): RuleItem[] {
  const requiredMsg = I18n.t('workflow_testset_required_tip', {
    param_name: I18n.t('workflow_testset_name'),
  });

  return [
    { required: true, message: requiredMsg },
    {
      asyncValidator: async (_rules, value: string, cb) => {
        // required
        if (!value) {
          cb(requiredMsg);
          return;
        }

        // In edit mode, skip when the name is the same as the original name
        if (originVal && value === originVal) {
          return;
        }

        // Chinese, letters, etc., etc
        const formatMsg = validateNamePattern(value, isOversea);

        if (formatMsg) {
          cb(formatMsg);
          return;
        }

        // Check for duplicates
        try {
          const { isPass } = await debuggerApi.CheckCaseDuplicate({
            bizCtx,
            bizComponentSubject,
            caseName: value,
          });

          if (isPass) {
            cb();
            return;
          }
          cb(I18n.t('workflow_testset_name_duplicated'));
          // eslint-disable-next-line @coze-arch/use-error-in-catch -- no catch
        } catch {
          cb();
        }
      },
    },
  ];
}

/**
 * Form label
 * - bot: choose the bot you need
 * - Other: field names
 */
export function getLabel(formSchema: FormItemSchema) {
  return formSchema.type === FormItemSchemaType.BOT
    ? I18n.t('workflow_testset_vardatabase_tip')
    : formSchema.name;
}

function getSubType(type: string) {
  switch (type) {
    case FormItemSchemaType.STRING:
      return 'String';
    case FormItemSchemaType.FLOAT:
    case FormItemSchemaType.NUMBER:
      return 'Number';
    case FormItemSchemaType.OBJECT:
      return 'Object';
    case FormItemSchemaType.BOOLEAN:
      return 'Boolean';
    case FormItemSchemaType.INTEGER:
      return 'Integer';
    default:
      return `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
  }
}

/** type label */
export function getTypeLabel(formSchema: FormItemSchema) {
  switch (formSchema.type) {
    case FormItemSchemaType.STRING:
    case FormItemSchemaType.FLOAT:
    case FormItemSchemaType.NUMBER:
    case FormItemSchemaType.OBJECT:
    case FormItemSchemaType.BOOLEAN:
    case FormItemSchemaType.INTEGER:
      return getSubType(formSchema.type);
    case FormItemSchemaType.LIST: {
      const subType = (formSchema.schema as ArrayFieldSchema).type;
      return subType ? `Array<${getSubType(subType)}>` : 'Array';
    }
    case FormItemSchemaType.BOT:
      return '';
    default:
      return formSchema.type;
  }
}

/**
 * placeholder
 * - bot: Please select bot
 * - Other: xx required
 */
export function getPlaceholder({ name, type }: FormItemSchema) {
  if (type === FormItemSchemaType.BOT) {
    return I18n.t('workflow_testset_vardatabase_placeholder');
  } else if (type === FormItemSchemaType.BOOLEAN) {
    return I18n.t('workflow_testset_please_select');
  }

  return I18n.t('workflow_detail_title_testrun_error_input', {
    a: name || '',
  });
}

/** The unique field name of the field in the form */
export function getSubFieldName(
  formSchema: NodeFormSchema,
  itemSchema: FormItemSchema,
) {
  return `${itemSchema.name}_${formSchema.component_id}`;
}

enum VariableTypeDTO {
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

function validateByJsonSchema(val: any, jsonSchema: any) {
  if (!jsonSchema || !val) {
    return true;
  }

  if (!ajv) {
    ajv = new Ajv();
  }

  try {
    const validate = ajv.compile(jsonSchema);
    const valid = validate(JSON.parse(val));

    return valid;
    // eslint-disable-next-line @coze-arch/use-error-in-catch -- no-catch
  } catch {
    return false;
  }
}

/**
 * Customize the form's additional parameters
 * Currently only jsonSchema validation is applied to array and object forms
 */
export function getCustomProps(formItemSchema: FormItemSchema) {
  switch (formItemSchema.type) {
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
        ] as RuleItem[],
      };
    }
    default:
      return {};
  }
}

export enum ValuesForBoolSelect {
  TRUE = 'true',
  FALSE = 'false',
  UNDEFINED = 'undefined',
}

/** Boolean Type Options */
export const optionsForBoolSelect = [
  {
    value: ValuesForBoolSelect.TRUE,
    label: 'true',
  },
  {
    value: ValuesForBoolSelect.FALSE,
    label: 'false',
  },
];

export function transBoolSelect2Bool(val?: ValuesForBoolSelect) {
  switch (val) {
    case ValuesForBoolSelect.TRUE:
      return true;
    case ValuesForBoolSelect.FALSE:
      return false;
    default:
      return undefined;
  }
}

export function transBool2BoolSelect(val?: boolean) {
  switch (val) {
    case true:
      return ValuesForBoolSelect.TRUE;
    case false:
      return ValuesForBoolSelect.FALSE;
    default:
      return undefined;
  }
}

export function transFormItemSchema2Form(ipt?: FormItemSchema) {
  if (ipt?.type === FormItemSchemaType.BOOLEAN) {
    return {
      ...ipt,
      value: transBool2BoolSelect(ipt.value as boolean | undefined),
    };
  }

  return ipt;
}
