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

import { ViewVariableType } from './view-variable-type';
import { type DTODefine, type InputValueDTO } from './dto';

/**
 * BlockInput is a type defined by the backend, which corresponds to InputValueDTO.
 */
export type BlockInput = InputValueDTO;

/**
 * BlockInput conversion method
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace BlockInput {
  /**
   * @param name
   * @param value
   * @param type
   * @example
   * {
   *  name: 'apiName',
   *  input: {
   *      type: 'string',
   *      value: {
   *          type: 'literal',
   *          content: 'xxxxxxxxx'
   *      }
   *  }
   * }
   */
  export function create(
    name: string,
    value = '',
    type: DTODefine.BasicVariableType = 'string',
  ): BlockInput {
    const blockInput: BlockInput = {
      name,
      input: {
        type,
        value: {
          type: 'literal',
          content: String(value),
        },
      },
    };
    let rawMetaType: ViewVariableType = ViewVariableType.String;
    switch (type) {
      case 'string':
        rawMetaType = ViewVariableType.String;
        break;
      case 'integer':
        rawMetaType = ViewVariableType.Integer;
        break;
      case 'float':
        rawMetaType = ViewVariableType.Number;
        break;
      case 'boolean':
        rawMetaType = ViewVariableType.Boolean;
        break;
      default:
        break;
    }
    blockInput.input.value.rawMeta = { type: rawMetaType };
    return blockInput;
  }
  export function createString(name: string, value: string): BlockInput {
    return create(name, value, 'string');
  }
  export function createInteger(name: string, value: string): BlockInput {
    return create(name, value, 'integer');
  }
  export function createFloat(name: string, value: string): BlockInput {
    return create(name, value, 'float');
  }

  export function createArray<T>(
    name: string,
    value: Array<T>,
    schema: unknown,
  ): BlockInput {
    return {
      name,
      input: {
        type: 'list',
        schema,
        value: {
          type: 'literal',
          content: value,
        },
      },
    };
  }

  export function createBoolean(name: string, value: boolean): BlockInput {
    const booleanInput = create(name, value as never, 'boolean');
    booleanInput.input.value.content = value;
    return booleanInput;
  }

  export function toLiteral<T>(blockInput: BlockInput): T {
    return blockInput.input.value.content as unknown as T;
  }

  export function isBlockInput(d: unknown): d is BlockInput {
    return (
      Boolean((d as BlockInput)?.name) &&
      typeof (d as BlockInput)?.input?.value?.content !== undefined
    );
  }
}
