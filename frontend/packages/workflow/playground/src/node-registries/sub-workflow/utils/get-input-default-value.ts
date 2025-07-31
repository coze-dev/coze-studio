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

import { variableUtils } from '@coze-workflow/variable';
import {
  type DTODefine,
  ValueExpressionType,
  VariableTypeDTO,
  type ValueExpression,
  type LiteralExpression,
} from '@coze-workflow/base';

const parseUploadURLFileName = (url: string) => {
  try {
    return new URL(url)?.searchParams?.get('x-wf-file_name') ?? 'unknown';
  } catch (e) {
    console.error(e);
    return '';
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getFileDefaultValue = (input: any): LiteralExpression => {
  const { defaultValue, assistType, type } = input;
  return {
    type: ValueExpressionType.LITERAL,
    content: defaultValue,
    rawMeta: {
      type: variableUtils.DTOTypeToViewType(type as VariableTypeDTO, {
        assistType,
      }),
      fileName: parseUploadURLFileName(defaultValue),
    },
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getFileListDefaultValue = (input: any): LiteralExpression => {
  const { defaultValue, type, schema } = input;
  const fileList = JSON.parse(defaultValue as string) as string[];

  return {
    type: ValueExpressionType.LITERAL,
    content: fileList,
    rawMeta: {
      type: variableUtils.DTOTypeToViewType(type as VariableTypeDTO, {
        arrayItemType: schema?.type,
        assistType: schema?.assistType,
      }),
      fileName: fileList.map(parseUploadURLFileName),
    },
  };
};

/**
 * Get the default value of the imported parameter of the child workflow node, and define the defaultValue of the parameter in the child workflow start node
 * @Param input workflow parameter definition
 * @returns
 */
export const getInputDefaultValue = (
  input: DTODefine.InputVariableDTO,
): ValueExpression => {
  const { defaultValue } = input;
  if (!defaultValue) {
    return {
      type: ValueExpressionType.REF,
    };
  }
  // Array<File>
  if (input.type === VariableTypeDTO.list && input.schema?.assistType) {
    return getFileListDefaultValue(input);
    // File
  } else if (input.type === VariableTypeDTO.string && input.assistType) {
    return getFileDefaultValue(input);
  } else if (
    input.type === VariableTypeDTO.list ||
    input.type === VariableTypeDTO.object
  ) {
    return {
      type: ValueExpressionType.REF,
    };
  } else {
    return {
      type: ValueExpressionType.LITERAL,
      content: variableUtils.getLiteralValueWithType(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        input.type as any,

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        input.defaultValue as any,
      ) as string | number | boolean,
    };
  }
};
