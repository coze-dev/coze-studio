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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { isInteger } from 'lodash-es';
import { ViewVariableType } from '@coze-workflow/base/types';

interface BotsParam {
  name: string;
  type: ViewVariableType;
  children?: Array<BotsParam>;
}

export enum ConvertSchemaErrorCode {
  MaxDepthExceeded = 0,
  ContainsInvalidValue,
}

export class ConvertSchemaError extends Error {
  errorType: ConvertSchemaErrorCode;
  constructor(errorType: ConvertSchemaErrorCode, message?: string) {
    super(message);
    this.errorType = errorType;
  }
}

export function convertSchema<T extends Object>(
  object: T,
  maxDepth = 20,
  currentDepth = 1,
): BotsParam[] {
  if (currentDepth > maxDepth) {
    throw new ConvertSchemaError(
      ConvertSchemaErrorCode.MaxDepthExceeded,
      'Max depth exceeded',
    );
  }
  const paramSchema: BotsParam[] = [];

  // if (object === null) {
  //   throw new ConvertSchemaError(
  //     ConvertSchemaErrorCode.ContainsInvalidValue,
  //     'ContainsInvalidValue',
  //   );
  // }

  Object.keys(object).forEach(key => {
    const value: unknown = (object as any)[key];
    switch (typeof value) {
      case 'string':
        paramSchema.push({
          name: key,
          type: ViewVariableType.String,
        });
        break;
      case 'number':
        if (isInteger(value)) {
          paramSchema.push({
            name: key,
            type: ViewVariableType.Integer,
          });
        } else {
          paramSchema.push({
            name: key,
            type: ViewVariableType.Number,
          });
        }
        break;
      case 'boolean':
        paramSchema.push({
          name: key,
          type: ViewVariableType.Boolean,
        });
        break;
      case 'object':
        if (value === null) {
          // omit null values
          break;
        }

        if (Array.isArray(value)) {
          if (value.length > 0) {
            switch (typeof value[0]) {
              case 'string':
                paramSchema.push({
                  name: key,
                  type: ViewVariableType.ArrayString,
                });
                break;
              case 'number':
                if (isInteger(value[0])) {
                  paramSchema.push({
                    name: key,
                    type: ViewVariableType.ArrayInteger,
                  });
                } else {
                  paramSchema.push({
                    name: key,
                    type: ViewVariableType.ArrayNumber,
                  });
                }
                break;
              case 'boolean':
                paramSchema.push({
                  name: key,
                  type: ViewVariableType.ArrayBoolean,
                });
                break;
              case 'object':
                paramSchema.push({
                  name: key,
                  type: ViewVariableType.ArrayObject,
                  children: convertSchema(value[0], maxDepth, currentDepth + 1),
                });
                break;

              default:
                paramSchema.push({
                  name: key,
                  type: ViewVariableType.ArrayString,
                });
            }
          } else {
            paramSchema.push({
              name: key,
              type: ViewVariableType.ArrayString,
            });
          }
        } else {
          paramSchema.push({
            name: key,
            type: ViewVariableType.Object,
            children: convertSchema(value, maxDepth, currentDepth + 1),
          });
        }
        break;
      default:
        console.log('value,to default', value);
        throw new ConvertSchemaError(
          ConvertSchemaErrorCode.ContainsInvalidValue,
          'ContainsInvalidValue',
        );
    }
  });
  return paramSchema;
}
