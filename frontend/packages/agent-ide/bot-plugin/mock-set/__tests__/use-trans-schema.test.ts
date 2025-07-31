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

import { renderHook } from '@testing-library/react-hooks';

import { useTransSchema } from '../src/hook/use-trans-schema';

vi.mock('@coze-arch/logger', () => ({
  logger: {
    createLoggerWith: vi.fn(),
  },
}));

vi.mock('@coze-arch/bot-utils', () => ({
  safeJSONParse: JSON.parse,
}));

describe('plugin-mock-data-hooks', () => {
  it('useTransSchema - compatible case 1 ', () => {
    const { result } = renderHook(() =>
      useTransSchema(
        '{"$schema":"https://json-schema.org/draft-07/schema","type":["object"],"additionalProperties":false}',
        '{}',
      ),
    );

    const { incompatible } = result.current;

    expect(incompatible).toEqual(false);
  });

  it('useTransSchema - compatible case 2', () => {
    const { result } = renderHook(() =>
      useTransSchema(
        '{"$schema":"https://json-schema.org/draft-07/schema","required":["num","str","bool"],"properties":{"bool":{"additionalProperties":false,"type":["boolean"]},"int":{"additionalProperties":false,"type":["integer"]},"num":{"additionalProperties":false,"type":["number"]},"str":{"additionalProperties":false,"type":["string"]}},"additionalProperties":false,"type":["object"]}',
        '{"int": 1,"num": 1.11,"str": "test","bool": true\n}',
      ),
    );

    const { incompatible } = result.current;

    expect(incompatible).toEqual(false);
  });

  it('useTransSchema - testValueValid', () => {
    const { result } = renderHook(() =>
      useTransSchema(
        '{"$schema":"https://json-schema.org/draft-07/schema","properties":{"response_for_model":{"additionalProperties":false,"type":"string"},"str":{"additionalProperties":false,"type":["string"]}},"additionalProperties":false,"type":["object"]}',
      ),
    );

    const { testValueValid } = result.current;

    const testPass = testValueValid('{"response_for_model": "xxx"}');
    const testFail1 = testValueValid(
      '{"response_for_model": "", "str": "hello"}',
    );
    const testFail2 = testValueValid('{}');

    expect(testPass).toEqual(true);
    expect(testFail1).toEqual(false);
    expect(testFail2).toEqual(false);
  });
});
