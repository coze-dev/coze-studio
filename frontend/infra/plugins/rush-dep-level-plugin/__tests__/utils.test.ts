import { isValidLevel, parseTagsLevel, isDepLevelMatch } from '../src/utils';

describe('utils', () => {
  describe('isValidLevel', () => {
    it('should return true for valid integer levels', () => {
      expect(isValidLevel(1)).toBe(true);
      expect(isValidLevel(0)).toBe(true);
      expect(isValidLevel(100)).toBe(true);
    });

    it('should return false for invalid levels', () => {
      expect(isValidLevel(1.5)).toBe(false);
      expect(isValidLevel('1')).toBe(false);
      expect(isValidLevel(null)).toBe(false);
      expect(isValidLevel(undefined)).toBe(false);
    });
  });

  describe('parseTagsLevel', () => {
    it('should parse level from tags correctly', () => {
      expect(parseTagsLevel(new Set(['level-1']))).toBe(1);
      expect(parseTagsLevel(new Set(['level-0']))).toBe(0);
      expect(parseTagsLevel(new Set(['other-tag', 'level-2']))).toBe(2);
    });

    it('should return null when no level tag found', () => {
      expect(parseTagsLevel(new Set([]))).toBeNull();
      expect(parseTagsLevel(new Set(['other-tag']))).toBeNull();
    });
  });

  describe('isDepLevelMatch', () => {
    it('should return true when project level is higher or equal', () => {
      expect(isDepLevelMatch(2, 1)).toBe(true);
      expect(isDepLevelMatch(2, 2)).toBe(true);
      expect(isDepLevelMatch(3, 1)).toBe(true);
    });

    it('should return false when project level is lower', () => {
      expect(isDepLevelMatch(1, 2)).toBe(false);
      expect(isDepLevelMatch(0, 1)).toBe(false);
    });
  });
});
