import { describe, it, expect } from 'vitest';

import { safeJsonParse } from '../../src/utils/safe-json-parse';

describe('utils-safe-json-parse', () => {
  // 测试正常解析 JSON 字符串
  it('should parse valid JSON string', () => {
    const jsonString = '{"key": "value"}';
    const result = safeJsonParse(jsonString);
    expect(result).toEqual({ key: 'value' });
  });

  // 测试解析无效 JSON 字符串
  it('should return undefined when parsing invalid JSON string', () => {
    const invalidJsonString = '{key: "value"}';
    const result = safeJsonParse(invalidJsonString);
    expect(result).toBeUndefined();
  });

  // 测试空字符串输入
  it('should return emptyValue when input is an empty string', () => {
    const emptyString = '';
    const emptyValue = {};
    const result = safeJsonParse(emptyString, { emptyValue });
    expect(result).toBe(emptyValue);
  });

  it('should return object when input is an empty object', () => {
    const value = {};
    expect(safeJsonParse(value)).toBe(value);
  });
});
