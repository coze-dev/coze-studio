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

import { useMemo } from 'react';

import { isBoolean, isNil, isNumber, isObject, isString } from 'lodash-es';

import { isBigNumber, bigNumberToString } from '../utils/big-number';
import { type Field } from '../types';
import { LogValueStyleType } from '../constants';

export const useValue = (value: Field['value']) => {
  const v = useMemo(() => {
    if (isNil(value)) {
      return {
        value: 'null',
        type: LogValueStyleType.Default,
      };
    } else if (isObject(value)) {
      // Large number Returns the numeric type, and the value is a string.
      if (isBigNumber(value)) {
        return {
          value: bigNumberToString(value),
          type: LogValueStyleType.Number,
        };
      }
      return {
        value: '',
        type: LogValueStyleType.Default,
      };
    } else if (isBoolean(value)) {
      return {
        value: value.toString(),
        type: LogValueStyleType.Boolean,
      };
    } else if (isString(value)) {
      return {
        value: JSON.stringify(value),
        type: LogValueStyleType.Default,
      };
    } else if (isNumber(value)) {
      return {
        value,
        type: LogValueStyleType.Number,
      };
    }
    return {
      value,
      type: LogValueStyleType.Default,
    };
  }, [value]);
  return v;
};
