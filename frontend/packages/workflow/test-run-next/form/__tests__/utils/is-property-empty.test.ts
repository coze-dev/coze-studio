import { describe, it, expect } from 'vitest';

import { isFormSchemaPropertyEmpty } from '../../src/utils/is-property-empty';

describe('isFormSchemaPropertyEmpty', () => {
  // 测试空对象
  it('should return true for an empty object', () => {
    const emptyObject = {};
    expect(isFormSchemaPropertyEmpty(emptyObject)).toBe(true);
  });

  // 测试非空对象
  it('should return false for a non-empty object', () => {
    const nonEmptyObject = { key: 'value' };
    expect(isFormSchemaPropertyEmpty(nonEmptyObject)).toBe(false);
  });

  // 测试非对象值
  it('should return true for non-object values', () => {
    const values = [null, undefined, 123, 'string', true, false, []];
    values.forEach(value => {
      expect(isFormSchemaPropertyEmpty(value)).toBe(true);
    });
  });
});
