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

import { expect, it } from 'vitest';
import { logger } from '@coze-arch/logger';

import { safeJSONParse, typeSafeJSONParse } from '../src/safe-json-parse';

vi.mock('@coze-arch/logger', () => ({
  logger: {
    persist: {
      error: vi.fn(),
    },
  },
  reporter: {
    errorEvent: vi.fn(),
  },
}));

describe('safe-json-parse', () => {
  test('safeJSONParse without error', () => {
    const test1 = '{}';
    const res1 = safeJSONParse(test1);
    expect(res1).toStrictEqual({});

    const test2 = '[]';
    const res2 = safeJSONParse(test2);
    expect(res2).toStrictEqual([]);

    expect(logger.persist.error).not.toHaveBeenCalled();
  });

  test('safeJSONParse with error', () => {
    const test = '';
    const res1 = safeJSONParse(test);
    expect(res1).equal(undefined);
    expect(logger.persist.error).toHaveBeenCalledTimes(1);

    const expectValue = 'empty_value';
    const res2 = safeJSONParse(test, expectValue);
    expect(res2).equal(expectValue);
    expect(logger.persist.error).toHaveBeenCalledTimes(2);
  });
});

describe('type safe json parse', () => {
  it('parse obj return as input', () => {
    const ob = {};
    expect(typeSafeJSONParse(ob)).toBe(ob);
  });

  it('parse legally', () => {
    const ob = { a: 1 };
    expect(typeSafeJSONParse(JSON.stringify(ob))).toMatchObject(ob);
  });

  it('throw error when illegal', () => {
    const str = '{';
    expect(typeSafeJSONParse(str)).toBeUndefined();
  });
});
