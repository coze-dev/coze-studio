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

/** Get the corresponding key name according to the value of StandardNodeType */
export function getStandardNodeTypeKey(
  value: string,
): keyof typeof StandardNodeType | undefined {
  const entries = Object.entries(StandardNodeType);
  const found = entries.find(([_, val]) => val === value);
  return found ? (found[0] as keyof typeof StandardNodeType) : undefined;
}

/** Get variable name */
export const getVariableName = (params: {
  /** variable expression */
  input: RefExpression;
  /** prefix */
  prefix?: string;
  /** suffix */
  suffix?: string;
  /** Name custom formatting */
  format?: NodeInputNameFormat;
  /** Node */
  node: WorkflowNodeEntity;
  /** Variable service */
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

/** Check if they have the same name */
const checkSameName = (
  name: string,
  inputParameters: InputValueVO[],
): number => {
  const sameNameVariables = inputParameters.filter(
    inputParameter => inputParameter.name === name,
  );
  return sameNameVariables.length;
};

/** Generate non-duplicate names */
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
  /** If there is a duplicate name, generate a new name */
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
