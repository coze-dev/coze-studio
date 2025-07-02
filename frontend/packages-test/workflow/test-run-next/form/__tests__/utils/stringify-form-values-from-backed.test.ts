import { describe, it, expect } from 'vitest';

import { stringifyFormValuesFromBacked } from '../../src/utils/stringify-form-values-from-backed';

describe('stringifyFormValuesFromBacked', () => {
  // 测试输入为空的情况
  it('should return undefined when input is null or undefined', () => {
    expect(stringifyFormValuesFromBacked(null as any)).toBeUndefined();
    expect(stringifyFormValuesFromBacked(undefined as any)).toBeUndefined();
  });

  // 测试输入包含字符串和布尔值的情况
  it('should return the same string and boolean values', () => {
    const input = {
      str: 'hello',
      bool: true,
    };
    const result = stringifyFormValuesFromBacked(input);
    expect(result).toEqual({
      str: 'hello',
      bool: true,
    });
  });

  // 测试输入包含对象和数组的情况
  it('should stringify objects and arrays', () => {
    const input = {
      obj: { key: 'value' },
      arr: [1, 2, 3],
    };
    const result = stringifyFormValuesFromBacked(input);
    expect(result).toEqual({
      obj: '{"key":"value"}',
      arr: '[1,2,3]',
    });
  });

  // 测试输入包含 null 和 undefined 的情况
  it('should set null and undefined values to undefined in the result', () => {
    const input = {
      nullValue: null,
      undefinedValue: undefined,
    };
    const result = stringifyFormValuesFromBacked(input);
    expect(result).toEqual({
      nullValue: undefined,
      undefinedValue: undefined,
    });
  });
});
