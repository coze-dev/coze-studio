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

// import { useEffect } from 'react';
import { useState } from 'react';

import { useMemoizedFn } from 'ahooks';
import { logger } from '@coze-arch/logger';
import { ComponentType } from '@coze-arch/bot-api/debugger_api';
import { debuggerApi } from '@coze-arch/bot-api';

import {
  type ArrayFieldSchema,
  type FormItemSchema,
  FormItemSchemaType,
  type ObjectFieldSchema,
  type NodeFormSchema,
} from '../types';
import { useTestsetManageStore } from './use-testset-manage-store';

export enum SchemaError {
  OK = '',
  EMPTY = 'empty',
  INVALID = 'invalid',
}

/** Variable name verification rules (parameter name verification for aligned workflow) */
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
  // Node parameter is empty
  if (!schema.inputs.length) {
    return false;
  }

  const nameSet = new Set<string>();
  for (const ipt of schema.inputs) {
    // Name illegal or duplicate
    if (!validateParamName(ipt.name) || nameSet.has(ipt.name)) {
      return false;
    }

    nameSet.add(ipt.name);

    // Detect complex types individually
    if (!checkArrayOrObjectField(ipt)) {
      return false;
    }
  }

  return true;
}

function validateSchema(json?: string) {
  if (!json) {
    return SchemaError.INVALID;
  }

  try {
    const schemas = JSON.parse(json) as NodeFormSchema[];

    // Schema is empty or start node inputs are empty
    const isEmpty =
      schemas.length === 0 ||
      (schemas[0].component_type === ComponentType.CozeStartNode &&
        schemas[0].inputs.length === 0);

    if (isEmpty) {
      return SchemaError.EMPTY;
    }

    for (const schema of schemas) {
      if (!checkNodeFormSchema(schema)) {
        return SchemaError.INVALID;
      }
    }

    return SchemaError.OK;
  } catch (e: any) {
    logger.error(e);
    return SchemaError.OK;
  }
}

/** Checks if the workflow node form is empty (schema is empty or start node inputs are empty) */
export function useCheckSchema() {
  const { bizComponentSubject, bizCtx } = useTestsetManageStore(store => store);
  const [schemaError, setSchemaError] = useState(SchemaError.OK);
  const [checking, setChecking] = useState(false);

  const checkSchema = useMemoizedFn(async () => {
    setChecking(true);
    try {
      const resp = await debuggerApi.GetSchemaByID({
        bizComponentSubject,
        bizCtx,
      });
      const err = validateSchema(resp.schemaJson);

      setSchemaError(err);
      return err;
    } catch (e: any) {
      logger.error(e);
      setSchemaError(SchemaError.OK);
      return SchemaError.OK;
    } finally {
      setChecking(false);
    }
  });

  return { schemaError, checkSchema, checking };
}
