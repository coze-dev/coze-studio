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
 
import { ViewVariableType, getFileAccept } from '@coze-workflow/base';

interface GenerateFieldComponentOptions {
  type: ViewVariableType;
  validateJsonSchema?: any;
}

export const generateFieldComponent = (
  options: GenerateFieldComponentOptions,
) => {
  const { type, validateJsonSchema } = options;
  /** 音色类型 */
  if (ViewVariableType.Voice === type) {
    return {
      ['x-component']: 'SelectVoice',
    };
  }
  /** 文件类型 */
  if (ViewVariableType.isFileType(type)) {
    const fileType = [
      ViewVariableType.Image,
      ViewVariableType.ArrayImage,
    ].includes(type)
      ? 'image'
      : 'object';
    return {
      ['x-component']: 'TypedFileInput',
      ['x-component-props']: {
        // 如果是数组类型，则表明是多选的文件选择器
        multiple: ViewVariableType.isArrayType(type),
        accept: getFileAccept(type),
        fileType,
      },
    };
  }
  /** 排除文件类型的对象类型、数组类型 */
  if (ViewVariableType.isArrayType(type) || ViewVariableType.Object === type) {
    return {
      ['x-component']: 'InputJson',
      ['x-component-props']: {
        jsonSchema: validateJsonSchema,
      },
      defaultValue: ViewVariableType.Object === type ? '{}' : '[]',
    };
  }
  if (type === ViewVariableType.Integer) {
    return {
      ['x-component']: 'InputInteger',
    };
  }
  if (type === ViewVariableType.Number) {
    return {
      ['x-component']: 'InputNumber',
    };
  }
  if (type === ViewVariableType.Boolean) {
    return {
      ['x-component']: 'SelectBoolean',
      defaultValue: true,
    };
  }
  if (type === ViewVariableType.Time) {
    return {
      ['x-component']: 'InputTime',
    };
  }
  /** string 类型和其它未知类型都渲染普通输入框 */
  return {
    ['x-component']: 'InputString',
  };
};
