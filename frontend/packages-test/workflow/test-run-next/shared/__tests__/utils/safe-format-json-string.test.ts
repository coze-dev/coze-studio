import { describe, it, expect } from 'vitest';

import { safeFormatJsonString } from '../../src/utils/safe-format-json-string';

describe('utils-safe-format-json-string', () => {
  it('value is not string', () => {
    const value = true;
    expect(safeFormatJsonString(value)).toBe(value);
  });
  it('value is not json string', () => {
    const value = 'string';
    expect(safeFormatJsonString(value)).toBe(value);
  });
});
