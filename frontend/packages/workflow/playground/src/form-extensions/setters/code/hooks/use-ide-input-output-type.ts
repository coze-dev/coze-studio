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

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { useService } from '@flowgram-adapter/free-layout-editor';
import {
  type ViewVariableTreeNode,
  ViewVariableType,
  WorkflowVariableService,
  type ValueExpression,
  ValueExpressionType,
} from '@coze-workflow/variable';
import { nodeUtils } from '@coze-workflow/nodes';
import { type InputValueVO } from '@coze-workflow/base';

import { useCodeSetterContext } from '../context';

export type InputParams = Array<{
  name: string;
  input: ValueExpression;
}>;
export type OutputParams = ViewVariableTreeNode[];
export interface ParsedOutput {
  name: string;
  type: ViewVariableType;
  children?: ParsedOutput[];
}

export interface ParsedOutputWithKey extends ParsedOutput {
  key?: string;
}

const recursiveParseOutput = (output?: OutputParams) => {
  if (!output) {
    return undefined;
  }

  return output.map(item => {
    const parsedOutput: ParsedOutput = {
      name: item.name,
      type: item.type,
    };
    if (item.children) {
      parsedOutput.children = recursiveParseOutput(item.children);
    }

    return parsedOutput;
  });
};

const recursiveParseInput = (options: {
  inputParams?: InputValueVO[];
  workflowVariableService: WorkflowVariableService;
  flowNodeEntity?: FlowNodeEntity;
}) => {
  const { inputParams, workflowVariableService, flowNodeEntity } = options;

  const parsedInput: Array<{
    name?: string;
    type?: ViewVariableType;
    children?: ViewVariableTreeNode[];
  }> = [];

  // eslint-disable-next-line complexity
  inputParams?.forEach(inputValue => {
    if (inputValue?.input?.type === ValueExpressionType.OBJECT_REF) {
      parsedInput.push({
        name: inputValue.name,
        type: ViewVariableType.Object,
        children: recursiveParseInput({
          ...options,
          inputParams: inputValue.children,
        }) as ViewVariableTreeNode[],
      });
    } else if (inputValue?.input?.type === ValueExpressionType.LITERAL) {
      parsedInput.push({
        name: inputValue.name,
        type:
          inputValue?.input?.rawMeta?.type ||
          nodeUtils.getLiteralExpressionViewVariableType(
            inputValue?.input?.content,
          ),
      });
    } else if (inputValue?.input?.type === ValueExpressionType.REF) {
      const refVariableMeta = workflowVariableService.getViewVariableByKeyPath(
        inputValue.input.content?.keyPath,
        { node: flowNodeEntity },
      );

      // The Code node has just been dragged into the canvas. The input may only have the key and no variable is selected. At this time, the type cannot be calculated. By default, a string is given.
      let type = refVariableMeta?.type || ViewVariableType.String;

      // File types are not supported in the code, just treat them as strings.
      if (ViewVariableType.isFileType(type)) {
        type = ViewVariableType.String;
      }

      parsedInput.push({
        name: inputValue.name,
        type,
        children: parseInputValueChildren(refVariableMeta?.children),
      });
    }
  });

  return parsedInput;
};

const parseInputValueChildren = (children?: ViewVariableTreeNode[]) => {
  if (!children) {
    return undefined;
  }
  return children.map(item => ({
    name: item.name,
    type: item.type,
    children: parseInputValueChildren(item.children),
  }));
};

export const useIDEInputOutputType = (options: {
  inputParams?: InputParams;
  outputParams?: OutputParams;
  outputPath: string;
}) => {
  const { inputParams, outputParams } = options;
  const { flowNodeEntity } = useCodeSetterContext();

  const workflowVariableService = useService<WorkflowVariableService>(
    WorkflowVariableService,
  );

  return {
    parsedInput: recursiveParseInput({
      inputParams,
      workflowVariableService,
      flowNodeEntity,
    }),
    parsedOutput: recursiveParseOutput(outputParams) ?? [],
  };
};
