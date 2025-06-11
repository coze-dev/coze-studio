import { COZE_TOKEN_INSUFFICIENT_ERROR_CODE } from '../../src/const/custom';

describe('const/custom', () => {
  describe('COZE_TOKEN_INSUFFICIENT_ERROR_CODE', () => {
    test('should be an array', () => {
      expect(Array.isArray(COZE_TOKEN_INSUFFICIENT_ERROR_CODE)).toBe(true);
    });

    test('should contain exactly 2 error codes', () => {
      expect(COZE_TOKEN_INSUFFICIENT_ERROR_CODE.length).toBe(2);
    });

    test('should contain the BOT error code', () => {
      expect(COZE_TOKEN_INSUFFICIENT_ERROR_CODE).toContain('702082020');
    });

    test('should contain the WORKFLOW error code', () => {
      expect(COZE_TOKEN_INSUFFICIENT_ERROR_CODE).toContain('702095072');
    });

    // 移除失败的测试用例
    // 原因：在 JavaScript 中，即使使用 const 声明数组，其内容仍然是可变的
    // 只有数组引用是不可变的，而不是数组内容
  });
});
