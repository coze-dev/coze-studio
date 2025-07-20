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
 
import { get } from 'lodash-es';
import { BlockInput, type InputValueDTO } from '@coze-workflow/base';

import { getDefaultOutput, isSplitMethod } from './utils';
import { type BackendData, type FormData } from './types';
import {
  BACK_END_NAME_MAP,
  CONCAT_DEFAULT_INPUTS,
  FIELD_NAME_MAP,
  OPTION_SCHEMA,
  PREFIX_STR,
  StringMethod,
} from './constants';

/**
 * 查找 InputValueDTO 中的某个字段
 * @param params
 * @param name
 * @returns
 */
function getParam(params: InputValueDTO[], name: string) {
  return params.find(item => item.name === name);
}

/**
 * 后端数据 -> 前端表单数据
 * @param value
 * @returns
 */
export const formatOnInit = (value: BackendData) => {
  // 初始化没有值时，返回字符串拼接默认设置
  if (!value) {
    return {
      method: StringMethod.Concat,
      inputParameters: CONCAT_DEFAULT_INPUTS,
      outputs: getDefaultOutput(StringMethod.Concat),
    };
  }

  const { nodeMeta, inputs, outputs } = value;
  const {
    method = StringMethod.Concat,
    inputParameters,
    splitParams,
    concatParams,
  } = inputs || {};

  const baseValue = {
    method,
    nodeMeta,
    outputs,
    inputParameters,
  };

  const isSplit = isSplitMethod(method);

  // 字符串拼接参数初始化处理
  if (!isSplit && Array.isArray(concatParams)) {
    // 拼接结果
    const resultItem = getParam(concatParams, FIELD_NAME_MAP.concatResult);

    // 拼接字符
    const charItem = getParam(
      concatParams,
      BACK_END_NAME_MAP.arrayItemConcatChar,
    );

    // 所有拼接字符
    const charOptions = getParam(
      concatParams,
      BACK_END_NAME_MAP.allArrayItemConcatChars,
    );

    // 如果存在拼接字符
    const hasChatOptions =
      charOptions &&
      (BlockInput.toLiteral(charOptions) as unknown[]).length > 0;

    if (resultItem) {
      baseValue[FIELD_NAME_MAP.concatResult] = BlockInput.toLiteral(resultItem);
    }

    if (hasChatOptions && charItem) {
      baseValue[FIELD_NAME_MAP.concatChar] = {
        value: BlockInput.toLiteral(charItem),
        options: BlockInput.toLiteral(charOptions),
      };
    }
  } else if (method === StringMethod.Split) {
    // 字符串分隔初始化处理
    if (!inputParameters?.length) {
      Object.assign(baseValue, {
        inputParameters: [{ name: PREFIX_STR }],
      });
    }

    if (Array.isArray(splitParams)) {
      // 当前选择分隔符
      const delimiterValueItem = getParam(
        splitParams,
        BACK_END_NAME_MAP.delimiters,
      );

      // 所有分隔符
      const delimiterOptionsItem = getParam(
        splitParams,
        BACK_END_NAME_MAP.allDelimiters,
      );

      // 是否存在分隔符选项
      const hasDelimiterOptions =
        delimiterOptionsItem &&
        (BlockInput.toLiteral(delimiterOptionsItem) as unknown[]).length > 0;

      if (hasDelimiterOptions && delimiterValueItem) {
        baseValue[FIELD_NAME_MAP.delimiter] = {
          value: BlockInput.toLiteral(delimiterValueItem),
          options: BlockInput.toLiteral(delimiterOptionsItem),
        };
      }
    }
  }

  return baseValue;
};

/**
 * 前端表单结构数据 -> 后端数据
 * @param value
 * @returns
 */
export const formatOnSubmit = (value: FormData) => {
  const method = get(value, FIELD_NAME_MAP.method);
  const nodeMeta = get(value, 'nodeMeta');

  // 拼接模式-拼接字符
  const arrayItemConcatChar = get(
    value,
    `${FIELD_NAME_MAP.concatChar}.value`,
    '',
  );

  // 拼接模式-所有拼接字符（包括自定义）
  const allArrayItemConcatChars = get(
    value,
    `${FIELD_NAME_MAP.concatChar}.options`,
    [],
  );

  // 拼接模式-拼接结果
  const concatResult = get(value, FIELD_NAME_MAP.concatResult, '');

  // 入参变量
  const inputParameters = get(value, 'inputParameters', []);

  // 分隔模式-分隔符
  const delimiterValue = get(value, `${FIELD_NAME_MAP.delimiter}.value`, []);

  // 分隔模式-所有分隔符（包括自定义）
  const allDelimiters = get(value, `${FIELD_NAME_MAP.delimiter}.options`, []);

  // 输出变量
  const outputs = get(value, FIELD_NAME_MAP.outputs);

  const baseValue = {
    nodeMeta,
    inputs: {
      method,
      inputParameters,
    },
    outputs,
  };

  if (!method) {
    return baseValue;
  }

  switch (method) {
    case StringMethod.Concat:
      Object.assign(baseValue.inputs, {
        concatParams: [
          // 拼接结果
          BlockInput.createString(FIELD_NAME_MAP.concatResult, concatResult),

          // 当前选择拼接符
          BlockInput.createString(
            BACK_END_NAME_MAP.arrayItemConcatChar,
            arrayItemConcatChar,
          ),

          // 当前所有拼接符
          BlockInput.createArray(
            BACK_END_NAME_MAP.allArrayItemConcatChars,
            allArrayItemConcatChars,
            OPTION_SCHEMA,
          ),
        ],
      });
      break;
    case StringMethod.Split:
      Object.assign(baseValue.inputs, {
        splitParams: [
          // 当前选择分隔符（多个）
          BlockInput.createArray(BACK_END_NAME_MAP.delimiters, delimiterValue, {
            type: 'string',
          }),

          // 当前所有分隔符
          BlockInput.createArray(
            BACK_END_NAME_MAP.allDelimiters,
            allDelimiters,
            OPTION_SCHEMA,
          ),
        ],
      });
      break;
    default:
      break;
  }

  return baseValue;
};
