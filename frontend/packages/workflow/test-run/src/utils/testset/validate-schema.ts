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
 
import { logger } from '@coze-arch/logger';
import {
  ComponentType,
  type BizCtx,
  type ComponentSubject,
} from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';

import type {
  ArrayFieldSchema,
  FormItemSchema,
  ObjectFieldSchema,
  NodeFormSchema,
  ValidateSchemaResult,
} from '../../types';
import { FormItemSchemaType } from '../../constants';

/** 变量命名校验规则（对齐workflow得参数名校验） */
const PARAM_NAME_VALIDATION_RULE =
  /^(?!.*\b(true|false|and|AND|or|OR|not|NOT|null|nil|If|Switch)\b)[a-zA-Z_][a-zA-Z_$0-9]*$/;

function validateParamName(name?: string) {
  return Boolean(name && PARAM_NAME_VALIDATION_RULE.test(name));
}

function isArrayOrObjectField(field: FormItemSchema) {
  return (
    field.type === FormItemSchemaType.LIST ||
    field.type === FormItemSchemaType.OBJECT
  );
}

function validateArrayOrObjectSchema(
  schema?: ObjectFieldSchema | ArrayFieldSchema,
) {
  if (!schema) {
    return false;
  }

  if (Array.isArray(schema)) {
    const nameSet = new Set<string>();
    for (const sub of schema) {
      if (!validateParamName(sub.name) || nameSet.has(sub.name)) {
        return false;
      }

      nameSet.add(sub.name);

      if (
        isArrayOrObjectField(sub) &&
        !validateArrayOrObjectSchema(sub.schema)
      ) {
        return false;
      }
    }

    return true;
  }

  return Boolean(schema.type);
}

function checkArrayOrObjectField(field: FormItemSchema) {
  if (!isArrayOrObjectField(field)) {
    return true;
  }

  if (!field.schema) {
    return false;
  }

  if (Array.isArray(field.schema)) {
    const nameSet = new Set<string>();
    for (const item of field.schema) {
      if (!validateParamName(item.name) || nameSet.has(item.name)) {
        return false;
      }

      nameSet.add(item.name);

      if (
        isArrayOrObjectField(item) &&
        !validateArrayOrObjectSchema(item.schema)
      ) {
        return false;
      }
    }
  }
  return true;
}

function checkNodeFormSchema(schema: NodeFormSchema) {
  // 节点参数为空
  if (!schema.inputs.length) {
    return false;
  }

  const nameSet = new Set<string>();
  for (const ipt of schema.inputs) {
    // 名称非法 or 重复
    if (!validateParamName(ipt.name) || nameSet.has(ipt.name)) {
      return false;
    }

    nameSet.add(ipt.name);

    // 单独检测复杂类型
    if (!checkArrayOrObjectField(ipt)) {
      return false;
    }
  }

  return true;
}

function validate(json?: string): ValidateSchemaResult {
  if (!json) {
    return 'invalid';
  }

  try {
    const schemas = JSON.parse(json) as NodeFormSchema[];

    // schema为空 or start节点的inputs为空
    if (
      schemas.length === 0 ||
      (schemas[0].component_type === ComponentType.CozeStartNode &&
        schemas[0].inputs.length === 0)
    ) {
      return 'empty';
    }

    for (const schema of schemas) {
      if (!checkNodeFormSchema(schema)) {
        return 'invalid';
      }
    }

    return 'ok';
  } catch (e: any) {
    logger.error(e);
    return 'ok';
  }
}

interface ValidateSchemaOptions {
  bizCtx?: BizCtx;
  bizComponentSubject?: ComponentSubject;
}

/** 检查workflow节点表单是否为空(schema为空 or start节点的inputs为空) */
export const validateTestsetSchema = async (
  options: ValidateSchemaOptions,
): Promise<ValidateSchemaResult> => {
  try {
    const resp = await debuggerApi.GetSchemaByID(options);
    const err = validate(resp.schemaJson);
    return err;
  } catch (e: any) {
    logger.error(e);
    return 'ok';
  }
};
