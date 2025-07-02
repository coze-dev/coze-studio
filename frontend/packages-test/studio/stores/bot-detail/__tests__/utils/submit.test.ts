import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { I18n } from '@coze-arch/i18n';
import { UIToast } from '@coze-arch/bot-semi';

import { hasBraces, verifyBracesAndToast } from '../../src/utils/submit';

// 模拟 UIToast 和 I18n
vi.mock('@coze-arch/bot-semi', () => ({
  UIToast: {
    warning: vi.fn(),
  },
}));

vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: vi.fn(key => {
      if (key === 'bot_prompt_bracket_error') {
        return '模板变量错误提示';
      }
      return key;
    }),
  },
}));

describe('submit utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('hasBraces', () => {
    it('当字符串包含 {{}} 时应该返回 true', () => {
      expect(hasBraces('这是一个包含 {{变量}} 的字符串')).toBe(true);
      expect(hasBraces('{{变量}}')).toBe(true);
      expect(hasBraces('前缀{{变量}}后缀')).toBe(true);
    });

    it('当字符串不包含 {{}} 时应该返回 false', () => {
      expect(hasBraces('这是一个普通字符串')).toBe(false);
      expect(hasBraces('这是一个包含 { 单括号 } 的字符串')).toBe(false);
      expect(hasBraces('')).toBe(false);
    });
  });

  describe('verifyBracesAndToast', () => {
    it('当 isAll=true 且字符串包含 {{}} 时，应该显示 toast 并返回 false', () => {
      const result = verifyBracesAndToast('包含 {{变量}} 的字符串', true);

      expect(result).toBe(false);
      expect(UIToast.warning).toHaveBeenCalledTimes(1);
      expect(UIToast.warning).toHaveBeenCalledWith({
        showClose: false,
        content: '模板变量错误提示',
      });
      expect(I18n.t).toHaveBeenCalledWith('bot_prompt_bracket_error');
    });

    it('当 isAll=true 但字符串不包含 {{}} 时，应该返回 true 且不显示 toast', () => {
      const result = verifyBracesAndToast('普通字符串', true);

      expect(result).toBe(true);
      expect(UIToast.warning).not.toHaveBeenCalled();
    });

    it('当 isAll=false 时，无论字符串是否包含 {{}}，都应该返回 true 且不显示 toast', () => {
      const result1 = verifyBracesAndToast('包含 {{变量}} 的字符串', false);
      const result2 = verifyBracesAndToast('普通字符串', false);

      expect(result1).toBe(true);
      expect(result2).toBe(true);
      expect(UIToast.warning).not.toHaveBeenCalled();
    });

    it('默认 isAll 为 false', () => {
      const result = verifyBracesAndToast('包含 {{变量}} 的字符串');

      expect(result).toBe(true);
      expect(UIToast.warning).not.toHaveBeenCalled();
    });
  });
});
