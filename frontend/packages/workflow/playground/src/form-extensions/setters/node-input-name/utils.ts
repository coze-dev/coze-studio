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
 
import { last } from 'lodash-es';
import type { FormItemMaterialContext } from '@flowgram-adapter/free-layout-editor';
import type { WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import type {
  RefExpression,
  WorkflowVariableFacadeService,
} from '@coze-workflow/variable';
import {
  type InputValueVO,
  StandardNodeType,
  WorkflowNode,
} from '@coze-workflow/base';

import type { NodeInputNameFormat } from './type';

/** 根据 StandardNodeType 的值获取对应的键名 */
export function getStandardNodeTypeKey(
  value: string,
): keyof typeof StandardNodeType | undefined {
  const entries = Object.entries(StandardNodeType);
  const found = entries.find(([_, val]) => val === value);
  return found ? (found[0] as keyof typeof StandardNodeType) : undefined;
}

/** 获取变量名称 */
export const getVariableName = (params: {
  /** 变量表达式 */
  input: RefExpression;
  /** 前缀 */
  prefix?: string;
  /** 后缀 */
  suffix?: string;
  /** 名称自定义格式化 */
  format?: NodeInputNameFormat;
  /** 节点 */
  node: WorkflowNodeEntity;
  /** 变量服务 */
  variableService: WorkflowVariableFacadeService;
}): string | undefined => {
  const { input, node, variableService, prefix = '', suffix = '' } = params;
  const keyPath = input?.content?.keyPath;

  if (
    input?.type !== 'ref' ||
    !Array.isArray(keyPath) ||
    keyPath.length === 0
  ) {
    return;
  }

  const fallbackName = last(keyPath);

  const variable = variableService.getVariableFacadeByKeyPath(keyPath, {
    node,
  });

  if (!variable) {
    return fallbackName;
  }

  const name =
    keyPath.length === 1
      ? getStandardNodeTypeKey(variable.node?.flowNodeType as string)
      : variable.viewMeta?.name;

  if (!name) {
    return fallbackName;
  }

  if (params.format) {
    return params.format({
      name,
      prefix,
      suffix,
      input,
      node,
    });
  }

  return `${prefix}${name}${suffix}`;
};

/** 检测是否有相同名称 */
const checkSameName = (
  name: string,
  inputParameters: InputValueVO[],
): number => {
  const sameNameVariables = inputParameters.filter(
    inputParameter => inputParameter.name === name,
  );
  return sameNameVariables.length;
};

/** 生成不重复的名称 */
export const getUniqueName = (params: {
  variableName: string;
  inputParameters: InputValueVO[];
}): string => {
  const { variableName, inputParameters } = params;
  if (!inputParameters) {
    return variableName;
  }
  const sameNames = checkSameName(variableName, inputParameters);
  if (sameNames === 0) {
    return variableName;
  }
  let nameIndex = 1;
  /** 如果存在重名，则生成一个新的名称 */
  while (true) {
    const currentName = `${variableName}${nameIndex}`;
    const currentSameNames = checkSameName(currentName, inputParameters);
    if (currentSameNames === 0) {
      return currentName;
    }
    nameIndex += 1;
  }
};

export const defaultGetNames = (context: FormItemMaterialContext): string[] => {
  const workflowNode = new WorkflowNode(context.node);
  const nodeInputParameters = workflowNode?.inputParameters ?? [];
  return nodeInputParameters
    .map(input => input.name)
    .filter(Boolean) as string[];
};
