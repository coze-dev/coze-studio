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
 * Find a field in InputValueDTO
 * @param params
 * @param name
 * @returns
 */
function getParam(params: InputValueDTO[], name: string) {
  return params.find(item => item.name === name);
}

/**
 * Backend Data - > Frontend Form Data
 * @param value
 * @returns
 */
export const formatOnInit = (value: BackendData) => {
  // When initialization has no value, return string concatenation default settings
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

  // String concatenation parameter initialization
  if (!isSplit && Array.isArray(concatParams)) {
    // Splicing result
    const resultItem = getParam(concatParams, FIELD_NAME_MAP.concatResult);

    // concatenated characters
    const charItem = getParam(
      concatParams,
      BACK_END_NAME_MAP.arrayItemConcatChar,
    );

    // All splicing characters
    const charOptions = getParam(
      concatParams,
      BACK_END_NAME_MAP.allArrayItemConcatChars,
    );

    // If there are splicing characters
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
    // String delimited initialization
    if (!inputParameters?.length) {
      Object.assign(baseValue, {
        inputParameters: [{ name: PREFIX_STR }],
      });
    }

    if (Array.isArray(splitParams)) {
      // Current selection separator
      const delimiterValueItem = getParam(
        splitParams,
        BACK_END_NAME_MAP.delimiters,
      );

      // All separators
      const delimiterOptionsItem = getParam(
        splitParams,
        BACK_END_NAME_MAP.allDelimiters,
      );

      // Is there a delimiter option?
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
 * Front-end form structure data - > back-end data
 * @param value
 * @returns
 */
export const formatOnSubmit = (value: FormData) => {
  const method = get(value, FIELD_NAME_MAP.method);
  const nodeMeta = get(value, 'nodeMeta');

  // Splicing Mode - Splicing Characters
  const arrayItemConcatChar = get(
    value,
    `${FIELD_NAME_MAP.concatChar}.value`,
    '',
  );

  // Splicing mode - all splicing characters (including customizations)
  const allArrayItemConcatChars = get(
    value,
    `${FIELD_NAME_MAP.concatChar}.options`,
    [],
  );

  // Splicing Mode - Splicing Results
  const concatResult = get(value, FIELD_NAME_MAP.concatResult, '');

  // Imported parameter variable
  const inputParameters = get(value, 'inputParameters', []);

  // Separator Mode - Separator
  const delimiterValue = get(value, `${FIELD_NAME_MAP.delimiter}.value`, []);

  // Separation mode - all separators (including customizations)
  const allDelimiters = get(value, `${FIELD_NAME_MAP.delimiter}.options`, []);

  // output variable
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
          // Splicing result
          BlockInput.createString(FIELD_NAME_MAP.concatResult, concatResult),

          // Current selection splice
          BlockInput.createString(
            BACK_END_NAME_MAP.arrayItemConcatChar,
            arrayItemConcatChar,
          ),

          // All current splices
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
          // Current selection separator (multiple)
          BlockInput.createArray(BACK_END_NAME_MAP.delimiters, delimiterValue, {
            type: 'string',
          }),

          // All current separators
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
