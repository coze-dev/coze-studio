import { describe, it, expect } from 'vitest';

import { isPersonalEnterprise } from '../../src/utils/personal';
import { PERSONAL_ENTERPRISE_ID } from '../../src/constants';

describe('isPersonalEnterprise', () => {
  it('should return true for personal enterprise id', () => {
    expect(isPersonalEnterprise(PERSONAL_ENTERPRISE_ID)).toBe(true);
  });

  it('should return false for non-personal enterprise id', () => {
    expect(isPersonalEnterprise('enterprise-1')).toBe(false);
  });
});
