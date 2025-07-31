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

/**
 * Calculate test form fields with formData
 */
import md5 from 'md5';
import { isObject } from 'lodash-es';
import Ajv from 'ajv';
import { type WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { isGlobalVariableKey, variableUtils } from '@coze-workflow/variable';
import {
  ViewVariableType,
  getSortedInputParameters,
} from '@coze-workflow/nodes';
import { type WorkflowNodesService } from '@coze-workflow/nodes';
import { ValueExpressionType, type VariableMetaDTO } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { getVariableInfoFromExpression } from '@/node-registries/http/components/variable-support/utils';

import { type TestFormField } from '../types';
import { type JSONEditorSchema } from '../test-form-materials/json-editor';
import { COMMON_FIELD, TYPE_FIELD_MAP } from '../constants';
import { isStaticObjectRef } from './is-static-object-ref';
import { ignoreRehajeExpressionString } from './ignore-rehaje-expression';
import { generateInputJsonSchema } from './generate-input-json-schema';

export type GenerateFn = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- formData can be any type
  d: any,
  context: {
    node: WorkflowNodeEntity;
  },
) => TestFormField[];

export type GenerateVariableFn = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- formData can be any type
  d: any,
  context: {
    node: WorkflowNodeEntity;
    labelPrefix?: string;
    namePrefix?: string;
  },
  nodesService: WorkflowNodesService,
) => TestFormField[];

export type GenerateAsyncFn = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- formData can be any type
  d: any,
  context: {
    node: WorkflowNodeEntity;
  },
) => Promise<TestFormField[]>;

export type GenerateRequiredFn = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- formData can be any type
  d: any,
  context: {
    node: WorkflowNodeEntity;
  },
  requiredRule: (key: string) => boolean,
) => TestFormField[];

let ajv: Ajv | undefined;
/**
 * Calculate table items by type
 */
export const generateField = (
  type: ViewVariableType,
  required = true,
  desc = '',
  jsonSchema?: JSONEditorSchema,
  // eslint-disable-next-line max-params
) => {
  const { validator: commonValidator, ...commonField } = COMMON_FIELD;
  const decorator = {
    ...commonField.decorator,
    props: {
      // Here is a hidden bug to avoid subsequent commonField.decorator after extending the props field
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...(commonField.decorator as any)?.props,
      tag: ViewVariableType.LabelMap[type],
      type,
    },
  };
  const {
    validator: typeValidator,
    component,
    ...typeField
  } = TYPE_FIELD_MAP[type];

  const jsonSchemaValidator = {
    triggerType: 'onBlur',
    message: I18n.t('workflow_debug_wrong_json'),
    validator: v => {
      if (!jsonSchema || !v) {
        return true;
      }

      if (!ajv) {
        ajv = new Ajv();
      }

      try {
        const validate = ajv.compile(jsonSchema);
        const valid = validate(JSON.parse(v));
        return valid;
        // eslint-disable-next-line @coze-arch/use-error-in-catch
      } catch (error) {
        // Parse failure indicates that it is not a legal value
        return false;
      }
    },
  };

  return {
    ...commonField,
    decorator,
    ...typeField,
    required,
    validator: [
      ...(required ? commonValidator : []),
      ...(typeValidator || []),
      jsonSchemaValidator,
    ],
    description: desc,
    originType: type,
    component: {
      ...component,
      props: {
        ...(component?.props || {}),
        jsonSchema,
      },
    },
  };
};

/**
 * From the historical code, it is inferred that the start node seems to have a type other than the enumeration. Here is a compatibility. It is not clear whether there is such old data for the time being.
 */
export const startNodeOldType2VariableType = (
  type: string | ViewVariableType,
): ViewVariableType => {
  switch (type) {
    case 'boolean':
      return ViewVariableType.Boolean;
    case 'number':
      return ViewVariableType.Number;
    case 'integer':
      return ViewVariableType.Integer;
    case 'string':
      return ViewVariableType.String;
    default:
      return type as ViewVariableType;
  }
};

/**
 * Convert the input structure of the object structure to a form entry
 */
export const generateObjectInputParameters: GenerateFn = (
  inputParameters,
  context,
) => {
  if (!inputParameters || !isObject(inputParameters)) {
    return [];
  }
  const array = Object.keys(inputParameters).map(key => ({
    name: key,
    input: inputParameters[key],
  }));
  return generateArrayInputParameters(array, context);
};

/**
 * Convert the input structure of the object structure into a form item, support setting required
 */
export const generateObjectInputParametersRequired: GenerateRequiredFn = (
  inputParameters,
  context,
  requiredRule,
) => {
  if (!inputParameters || !isObject(inputParameters)) {
    return [];
  }
  const array = Object.keys(inputParameters).map(key => ({
    name: key,
    input: inputParameters[key],
    required: requiredRule(key) ?? false,
  }));
  return generateArrayInputParameters(array, context);
};

/**
 * Convert the input structure of an array structure to a list entry
 */
export const generateArrayInputParameters: GenerateFn = (
  inputParameters,
  { node },
) => {
  if (!inputParameters || !Array.isArray(inputParameters)) {
    return [];
  }
  const inputFields = inputParameters.filter(i => {
    /** Object reference types do not need to be filtered, all static fields need to be filtered */
    if (i.input?.type === ValueExpressionType.OBJECT_REF) {
      return !isStaticObjectRef(i);
    }
    /** Direct filtering of non-reference types, no direct filtering of reference values */
    if (i.input?.type !== 'ref' || !i.input?.content) {
      return false;
    }
    /** If the reference is from itself, there is no need to fill it in */
    const [nodeId] = i.input.content.keyPath || [];
    if (nodeId && nodeId === node.id) {
      return false;
    }
    if (isGlobalVariableKey(nodeId)) {
      return false;
    }

    return true;
  });

  const sortedInputFields = getSortedInputParameters(inputFields);
  return sortedInputFields.map(data => {
    if (data.input.type === ValueExpressionType.OBJECT_REF) {
      const dtoMeta = variableUtils.inputValueToDTO(
        data,
        node.context.variableService,
        { node },
      );
      const jsonSchema = generateInputJsonSchema(
        (dtoMeta || {}) as VariableMetaDTO,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (v: any) => ({
          name: v?.name,
          ...(v?.input || {}),
        }),
      );
      return {
        title: data.label || data.name,
        name: data.name,
        ...generateField(
          ViewVariableType.Object,
          data?.required,
          data.description,
          jsonSchema,
        ),
      };
    }

    const workflowVariable =
      node.context.variableService.getWorkflowVariableByKeyPath(
        data.input.content.keyPath,
        { node },
      );

    const viewVariable = workflowVariable?.viewMeta;
    const type: ViewVariableType =
      variableUtils.getValueExpressionViewType(
        data.input,
        node.context.variableService,
        { node },
      ) || ViewVariableType.String;

    const dtoMeta = variableUtils.getValueExpressionDTOMeta(
      data.input,
      node.context.variableService,
      { node },
    );

    const jsonSchema = generateInputJsonSchema(
      (dtoMeta || {}) as VariableMetaDTO,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fieldItem: any = generateField(
      type,
      data?.required,
      data.description,
      jsonSchema,
    );
    const variableInitialValue = ignoreRehajeExpressionString(
      viewVariable?.defaultValue,
    );
    if (variableInitialValue !== undefined) {
      fieldItem.initialValue = variableInitialValue;
    }
    return {
      title: data.label || data.name,
      name: data.name,
      /** Reserved variable meta */
      dtoMeta,
      ...fieldItem,
    };
  });
};

/**
 * Converts a string containing a {{}} reference variable expression to a form entry
 */
export const generateExpressionString: GenerateVariableFn = (
  expressionStr,
  {
    node,
    /**
     * Label prefix for form display
     */
    labelPrefix = '',
    /**
     * Name prefix, used to distinguish variables
     */
    namePrefix = '',
  },
  nodesService,
) => {
  if (!expressionStr) {
    return [];
  }
  const doubleBracedPattern = /{{([^}]+)}}/g;
  const matches = expressionStr.match(doubleBracedPattern);
  // Remove {{}} from string
  const matchesContent = matches?.map((varStr: string) =>
    varStr.replace(/^{{|}}$/g, ''),
  );

  const inputField: TestFormField[] = [];
  const formFields: TestFormField[] = [];

  matchesContent?.forEach((varStr: string) => {
    const {
      // isGlobalVariable,
      nodeNameWithDot,
      fieldPart,
      fieldKeyPath,
      // parsedKeyPath,
    } = getVariableInfoFromExpression(varStr);

    // case:__body_bodyData_rawText + md5("block_out_100001.input.field")
    const fieldName = namePrefix + md5(nodeNameWithDot + fieldPart);
    // Duplicate variables are displayed only once
    if (!inputField.find((item: TestFormField) => item.name === fieldName)) {
      inputField.push({
        label: fieldPart,
        name: fieldName,
        // Fill in the default value here, which will be replaced by the real type of the variable later.
        type: '1',
        input: {
          type: 'ref',
          content: {
            keyPath: fieldKeyPath,
          },
        },
      });
    }
  });

  inputField.forEach(data => {
    const workflowVariable =
      node.context.variableService.getWorkflowVariableByKeyPath(
        data.input.content?.keyPath,
        { node },
      );

    // The variable cannot be found, indicating that it is an invalid expression, so filter it directly.
    // Global variables are tested with default values, no data is required
    if (workflowVariable && !workflowVariable.globalVariableKey) {
      const nodeTitle = nodesService.getNodeTitle(workflowVariable?.node);
      const type = workflowVariable.viewType ?? ViewVariableType.String;
      const jsonSchema = generateInputJsonSchema(
        workflowVariable?.dtoMeta as VariableMetaDTO,
      );

      formFields.push({
        title: `${labelPrefix}-${nodeTitle}-${data.label}` || data.name,
        name: data.name,
        ...generateField(type, data?.required, data.description, jsonSchema),
      });
    }
  });

  return formFields;
};
