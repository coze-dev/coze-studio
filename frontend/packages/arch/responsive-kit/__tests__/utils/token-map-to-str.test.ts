import { describe, it, expect } from 'vitest';

import { tokenMapToStr } from '../../src/utils/token-map-to-str';
import type { ResponsiveTokenMap } from '../../src/types';
import { ScreenRange } from '../../src/constant';

describe('tokenMapToStr', () => {
  it('should return empty string for empty token map', () => {
    const result = tokenMapToStr({}, 'prefix');
    expect(result).toBe('');
  });

  it('should convert token map to string with prefix', () => {
    const tokenMap: ResponsiveTokenMap<ScreenRange> = {
      [ScreenRange.SM]: 1,
      [ScreenRange.MD]: 2,
      [ScreenRange.LG]: 3,
    };

    const result = tokenMapToStr(tokenMap, 'test-prefix');

    expect(result).toBe('sm:test-prefix-1 md:test-prefix-2 lg:test-prefix-3');
  });

  it('should handle token map with single entry', () => {
    const tokenMap: ResponsiveTokenMap<ScreenRange> = {
      [ScreenRange.SM]: 1,
    };

    const result = tokenMapToStr(tokenMap, 'prefix');

    expect(result).toBe('sm:prefix-1');
  });

  it('should handle token map with undefined values', () => {
    const tokenMap: ResponsiveTokenMap<ScreenRange> = {
      [ScreenRange.SM]: 1,
      [ScreenRange.MD]: undefined,
      [ScreenRange.LG]: 3,
    };

    const result = tokenMapToStr(tokenMap, 'prefix');

    // 根据实际实现，undefined值会被转换为字符串"undefined"
    expect(result).toBe('sm:prefix-1 md:prefix-undefined lg:prefix-3');
  });

  it('should handle token map with basic value', () => {
    const tokenMap: ResponsiveTokenMap<ScreenRange> = {
      basic: 0,
      [ScreenRange.SM]: 1,
      [ScreenRange.LG]: 3,
    };

    const result = tokenMapToStr(tokenMap, 'prefix');

    // basic should not have a screen prefix
    expect(result).toBe('prefix-0 sm:prefix-1 lg:prefix-3');
  });

  it('should handle token map with zero values', () => {
    const tokenMap: ResponsiveTokenMap<ScreenRange> = {
      [ScreenRange.SM]: 0,
      [ScreenRange.MD]: 0,
      [ScreenRange.LG]: 0,
    };

    const result = tokenMapToStr(tokenMap, 'prefix');

    expect(result).toBe('sm:prefix-0 md:prefix-0 lg:prefix-0');
  });

  it('should handle token map with decimal values', () => {
    const tokenMap: ResponsiveTokenMap<ScreenRange> = {
      [ScreenRange.SM]: 1.5,
      [ScreenRange.MD]: 2.75,
      [ScreenRange.LG]: 3.25,
    };

    const result = tokenMapToStr(tokenMap, 'prefix');

    expect(result).toBe('sm:prefix-1.5 md:prefix-2.75 lg:prefix-3.25');
  });
});
