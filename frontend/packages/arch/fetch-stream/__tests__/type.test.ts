import { describe, it, expect } from 'vitest';

import { FetchStreamErrorCode, type ValidateResult } from '../src/type';

describe('type definitions', () => {
  describe('FetchStreamErrorCode', () => {
    it('应该包含正确的错误码', () => {
      expect(FetchStreamErrorCode.FetchException).toBe(10001);
      expect(FetchStreamErrorCode.HttpChunkStreamingException).toBe(10002);
    });
  });

  describe('ValidateResult', () => {
    it('应该支持成功状态', () => {
      const successResult: ValidateResult = { status: 'success' };
      expect(successResult.status).toBe('success');
    });

    it('应该支持错误状态', () => {
      const errorResult: ValidateResult = {
        status: 'error',
        error: new Error('Test error'),
      };
      expect(errorResult.status).toBe('error');
      expect(errorResult.error).toBeInstanceOf(Error);
    });
  });
});
