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
