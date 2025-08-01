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

import {
  isFunction,
  isObject,
  getPayloadByFormatter,
} from '../../src/utils/index';
import { type DebounceConfig, DebounceTime } from '../../src/type/index';

describe('isFunction', () => {
  const fn: DebounceConfig = () => DebounceTime.Immediate;

  const ob: DebounceConfig = {
    default: DebounceTime.Immediate,
  };

  it('isFunction should return true when the input is function', () => {
    const result = isFunction(fn);

    expect(result).toBe(true);
  });

  it('isFunction should return false when the input is object', () => {
    const result = isFunction(ob);

    expect(result).toBe(false);
  });

  it('isObject should return true when the input is object', () => {
    const result = isObject(ob);

    expect(result).toBe(true);
  });
});

describe('getPayloadByFormatter', () => {
  it('should return state directly if formatter is not provided', async () => {
    const state = { key: 'value' };

    const result = await getPayloadByFormatter(state);

    expect(result).toEqual(state);
  });

  it('should call formatter and return its result if formatter is provided', async () => {
    const state = { key: 'value' };
    const formatter = vi
      .fn()
      .mockResolvedValue({ formattedKey: 'formattedValue' });

    const result = await getPayloadByFormatter(state, formatter);

    expect(formatter).toHaveBeenCalledWith(state);
    expect(result).toEqual({ formattedKey: 'formattedValue' });
  });
});
