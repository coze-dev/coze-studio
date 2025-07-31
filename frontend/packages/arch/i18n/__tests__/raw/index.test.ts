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

import { describe, it, expect, vi, beforeEach } from 'vitest';

import { I18n, initI18nInstance } from '../../src/raw';

// Simulate localized resources
vi.mock('../../src/resource.ts', () => ({
  default: {
    en: { i18n: { test: 'Test' } },
    'zh-CN': { i18n: { test: '测试' } },
  },
}));

describe('raw/index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export I18n', () => {
    expect(I18n).toBeDefined();
  });

  it('should initialize I18n with default config', async () => {
    await initI18nInstance();
    expect(I18n.plugins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'languageDetector' }),
      ]),
    );
    expect(I18n.i18nInstance.config).toEqual(
      expect.objectContaining({
        fallbackLng: 'en',
        lng: 'en',
        ns: 'i18n',
        defaultNS: 'i18n',
        resources: expect.any(Object),
      }),
    );
  });

  it('should initialize I18n with custom config', async () => {
    const customConfig = {
      lng: 'zh-CN' as const,
      ns: 'custom',
      debug: true,
    };

    await initI18nInstance(customConfig);

    expect(I18n.plugins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'languageDetector' }),
      ]),
    );
    expect(I18n.i18nInstance.config).toEqual(
      expect.objectContaining({
        fallbackLng: 'zh-CN',
        lng: 'zh-CN',
        ns: 'custom',
        defaultNS: 'custom',
        debug: true,
        resources: expect.any(Object),
      }),
    );
    expect(I18n.t('test', { ns: 'i18n' })).toEqual('测试');
  });
  it('should call addResourceBundle method', () => {
    const lng = 'en';
    const ns = 'test';
    const resources = {
      en: { i18n: { test: 'Test' } },
    };
    const deep = true;
    const overwrite = false;

    I18n.addResourceBundle(lng, ns, resources, deep, overwrite);
    expect(I18n.t('test', { ns: 'i18n' })).toEqual('测试');
    expect(I18n.t('unknown')).toEqual('unknown');
  });
  it('should get languages', () => {
    let fireCallback = false;
    I18n.setLang('en', () => {
      fireCallback = true;
    });
    expect(I18n.t('test', { ns: 'i18n' })).toEqual('Test');
    expect(fireCallback).toEqual(true);

    I18n.setLangWithPromise('zh-CN').then(() => {
      expect(I18n.t('test', { ns: 'i18n' })).toEqual('测试');
    });
    expect(I18n.dir('en', { ns: 'i18n' })).toEqual('ltr');
    expect(I18n.language).toEqual('zh-CN');
  });
});
