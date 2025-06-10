import { describe, test, expect, vi } from 'vitest';
import { I18n } from '@coze-arch/i18n';

import { codeEmptyValidator } from '../code-empty-validator';

// 模拟I18n.t方法
vi.mock('@coze-arch/i18n', () => ({
  I18n: { t: vi.fn(key => `translated_${key}`) },
}));

describe('codeEmptyValidator', () => {
  test('当value.code存在时返回true', () => {
    const result = codeEmptyValidator({ value: { code: 'some code' } });
    expect(result).toBe(true);
  });

  test('当value.code不存在时返回翻译后的错误信息', () => {
    const result = codeEmptyValidator({ value: {} });
    expect(I18n.t).toHaveBeenCalledWith('workflow_running_results_error_code');
    expect(result).toBe('translated_workflow_running_results_error_code');
  });
});
