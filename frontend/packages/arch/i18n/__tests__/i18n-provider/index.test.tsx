import React from 'react';

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { I18nProvider } from '../../src/i18n-provider';

vi.mock('@coze-arch/coze-design/locales', () => ({
  CDLocaleProvider: vi.fn(() => ({
    render: vi.fn().mockImplementation(r => r),
  })),
}));

describe('I18nProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(I18nProvider).toBeDefined();
  });

  it('should render with default i18n when no i18n prop is provided', () => {
    const children = <div>Test</div>;
    const provider = new I18nProvider({ children });
    const result = provider.render().props.children;

    // 验证渲染结果
    expect(result).toBeDefined();
    expect(result.props).toBeDefined();
    expect(result.props.value).toBeDefined();
    expect(result.props.value.i18n).toBeDefined();
    expect(typeof result.props.value.i18n.t).toBe('function');
    expect(result.props.children).toBe(children);

    // 验证默认的 t 函数行为
    const defaultT = result.props.value.i18n.t;
    expect(defaultT('test-key')).toBe('test-key');
  });

  it('should render with provided i18n', () => {
    const children = <div>Test</div>;
    const mockI18n = {
      t: vi.fn(key => `translated-${key}`),
      i18nInstance: {},
      init: vi.fn(),
      use: vi.fn(),
      language: 'zh-CN',
      languages: ['zh-CN', 'en-US'],
      messages: {},
      formatMessage: vi.fn(),
    };

    const provider = new I18nProvider({ children, i18n: mockI18n as any });
    const result = provider.render().props.children;

    // 验证渲染结果
    expect(result).toBeDefined();
    expect(result.props).toBeDefined();
    expect(result.props.value).toBeDefined();
    expect(result.props.value.i18n).toBe(mockI18n);
    expect(result.props.children).toBe(children);

    // 验证使用了提供的 i18n
    const key = 'test-key';
    result.props.value.i18n.t(key);
    expect(mockI18n.t).toHaveBeenCalledWith(key);
    expect(mockI18n.t(key)).toBe('translated-test-key');
  });
});
