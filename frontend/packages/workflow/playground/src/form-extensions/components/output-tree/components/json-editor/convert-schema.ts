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

interface ParamSchemaType {
  name: string;
  type: number;
  children?: ParamSchemaType[];
}

export function convertSchema(object, maxDepth = 20, currentDepth = 1) {
  if (currentDepth > maxDepth) {
    throw new Error('Max depth exceeded');
  }

  const paramSchema: ParamSchemaType[] = [];
  Object.keys(object).forEach(key => {
    const value = object[key];
    switch (typeof value) {
      case 'string':
        paramSchema.push({
          name: key,
          type: 1 /* String */,
        });
        break;
      case 'number':
        if (Number.isInteger(value)) {
          paramSchema.push({
            name: key,
            type: 2 /* Integer */,
          });
        } else {
          paramSchema.push({
            name: key,
            type: 4 /* Number */,
          });
        }
        break;
      case 'boolean':
        paramSchema.push({
          name: key,
          type: 3 /* Boolean */,
        });
        break;
      case 'object':
        if (value === null) {
          break;
        }
        if (Array.isArray(value)) {
          if (value.length > 0) {
            switch (typeof value[0]) {
              case 'string':
                paramSchema.push({
                  name: key,
                  type: 99 /* ArrayString */,
                });
                break;
              case 'number':
                if (Number.isInteger(value[0])) {
                  paramSchema.push({
                    name: key,
                    type: 100 /* ArrayInteger */,
                  });
                } else {
                  paramSchema.push({
                    name: key,
                    type: 102 /* ArrayNumber */,
                  });
                }
                break;
              case 'boolean':
                paramSchema.push({
                  name: key,
                  type: 101 /* ArrayBoolean */,
                });
                break;
              case 'object':
                paramSchema.push({
                  name: key,
                  type: 103 /* ArrayObject */,
                  children: convertSchema(value[0], maxDepth, currentDepth + 1),
                });
                break;
              default:
                paramSchema.push({
                  name: key,
                  type: 99 /* ArrayString */,
                });
            }
          } else {
            paramSchema.push({
              name: key,
              type: 99 /* ArrayString */,
            });
          }
        } else {
          paramSchema.push({
            name: key,
            type: 6 /* Object */,
            children: convertSchema(value, maxDepth, currentDepth + 1),
          });
        }
        break;
      default:
        console.log('value,to default', value);
        throw new Error('ContainsInvalidValue');
    }
  });
  return paramSchema;
}
