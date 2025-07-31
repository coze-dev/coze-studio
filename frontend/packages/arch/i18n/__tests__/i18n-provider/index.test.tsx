/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

    // Validate the render result
    expect(result).toBeDefined();
    expect(result.props).toBeDefined();
    expect(result.props.value).toBeDefined();
    expect(result.props.value.i18n).toBeDefined();
    expect(typeof result.props.value.i18n.t).toBe('function');
    expect(result.props.children).toBe(children);

    // Verify the default t function behavior
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

    // Validate the render result
    expect(result).toBeDefined();
    expect(result.props).toBeDefined();
    expect(result.props.value).toBeDefined();
    expect(result.props.value.i18n).toBe(mockI18n);
    expect(result.props.children).toBe(children);

    // Verify that the provided i18n is used.
    const key = 'test-key';
    result.props.value.i18n.t(key);
    expect(mockI18n.t).toHaveBeenCalledWith(key);
    expect(mockI18n.t(key)).toBe('translated-test-key');
  });
});
