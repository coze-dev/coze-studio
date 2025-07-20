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
 * 通过 formData 计算 test form 的 fields
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- formData 可以是任意类型
  d: any,
  context: {
    node: WorkflowNodeEntity;
  },
) => TestFormField[];

export type GenerateVariableFn = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- formData 可以是任意类型
  d: any,
  context: {
    node: WorkflowNodeEntity;
    labelPrefix?: string;
    namePrefix?: string;
  },
  nodesService: WorkflowNodesService,
) => TestFormField[];

export type GenerateAsyncFn = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- formData 可以是任意类型
  d: any,
  context: {
    node: WorkflowNodeEntity;
  },
) => Promise<TestFormField[]>;

export type GenerateRequiredFn = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- formData 可以是任意类型
  d: any,
  context: {
    node: WorkflowNodeEntity;
  },
  requiredRule: (key: string) => boolean,
) => TestFormField[];

let ajv: Ajv | undefined;
/**
 * 通过类型计算表单项
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
      // 这里是避免后续 commonField.decorator 扩展 props 字段后这里有隐藏的 bug
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
        // parse失败说明不是合法值
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
 * 从历史代码推断 start 节点好像存在枚举以外的类型，这里做一下兼容，暂时不清楚有没有这种老数据
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
 * 将 object 结构的 input 结构转化为表单项
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
 * 将 object 结构的 input 结构转化为表单项，支持设置必填
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
 * 将 array 结构的 input 结构转化为表单项
 */
export const generateArrayInputParameters: GenerateFn = (
  inputParameters,
  { node },
) => {
  if (!inputParameters || !Array.isArray(inputParameters)) {
    return [];
  }
  const inputFields = inputParameters.filter(i => {
    /** 对象引用类型不需要过滤，全是静态字段的需要过滤 */
    if (i.input?.type === ValueExpressionType.OBJECT_REF) {
      return !isStaticObjectRef(i);
    }
    /** 非引用类型直接过滤，引用值不存在直接过滤 */
    if (i.input?.type !== 'ref' || !i.input?.content) {
      return false;
    }
    /** 如果引用来自于自身，则不需要再填写 */
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
      /** 保留变量的 meta */
      dtoMeta,
      ...fieldItem,
    };
  });
};

/**
 * 将包含 {{}} 引用变量表达式的字符串转化为表单项
 */
export const generateExpressionString: GenerateVariableFn = (
  expressionStr,
  {
    node,
    /**
     * label 前缀，用于表单展示
     */
    labelPrefix = '',
    /**
     * name 前缀，用于区分变量
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
  // 去除字符串里的 {{}}
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
    // 重复变量只展示一次
    if (!inputField.find((item: TestFormField) => item.name === fieldName)) {
      inputField.push({
        label: fieldPart,
        name: fieldName,
        // 这里填默认值，后面会被变量真实类型替换
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

    // 找不到变量说明是无效表达式，直接过滤
    // 全局变量取默认值测试，不需要填写数据
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
