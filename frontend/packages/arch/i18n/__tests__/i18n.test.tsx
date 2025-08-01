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

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

import { I18n, getUnReactiveLanguage } from '../src/index';

describe('I18n', () => {
  beforeAll(() => {
    I18n.init({
      lng: 'en',
      fallbackLng: 'en',
      resources: {
        en: { i18n: { test: 'Test', 'test-key': 'test-key-value' } },
        'zh-CN': { i18n: { test: '测试' } },
      },
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have basic methods', () => {
    expect(I18n).toBeDefined();
    expect(I18n.language).toBe('en');
    expect(I18n.t).toBeDefined();
    expect(typeof I18n.t).toBe('function');
  });

  it('should get language', () => {
    expect(getUnReactiveLanguage()).toBe('en');
  });

  it('should call init method', () => {
    const initSpy = vi.spyOn(I18n, 'init');
    const config = { lng: 'en' };
    const callback = vi.fn();

    I18n.init(config, callback);

    expect(initSpy).toHaveBeenCalledWith(config, callback);
  });

  it('should call use method', () => {
    const useSpy = vi.spyOn(I18n, 'use');
    const plugin = {};

    I18n.use(plugin);

    expect(useSpy).toHaveBeenCalledWith(plugin);
  });

  it('should call setLang method', () => {
    const setLangSpy = vi.spyOn(I18n, 'setLang');
    const lang = 'zh-CN';
    const callback = vi.fn();

    I18n.setLang(lang, callback);

    expect(setLangSpy).toHaveBeenCalledWith(lang, callback);
  });

  it('should call getLanguages method', () => {
    const getLanguagesSpy = vi.spyOn(I18n, 'getLanguages');

    const result = I18n.getLanguages();

    expect(getLanguagesSpy).toHaveBeenCalled();
    expect(result).toEqual(['zh-CN', 'zh', 'en-US']);
  });

  it('should call dir method', () => {
    const dirSpy = vi.spyOn(I18n, 'dir');

    const result = I18n.dir();

    expect(dirSpy).toHaveBeenCalled();
    expect(result).toBe('ltr');
  });

  it('should call addResourceBundle method', () => {
    const addResourceBundleSpy = vi.spyOn(I18n, 'addResourceBundle');
    const lng = 'en';
    const ns = 'test';
    const resources = { key: 'value' };
    const deep = true;
    const overwrite = false;

    I18n.addResourceBundle(lng, ns, resources, deep, overwrite);

    expect(addResourceBundleSpy).toHaveBeenCalledWith(
      lng,
      ns,
      resources,
      deep,
      overwrite,
    );
  });

  it('should call t method', () => {
    I18n.setLang('en');
    const tSpy = vi.spyOn(I18n, 't');
    const key = 'test-key';
    const options = { ns: 'i18n' };
    const fallbackText = 'fallback';

    const result = I18n.t(key as any, options, fallbackText);

    expect(tSpy).toHaveBeenCalledWith(key, options, fallbackText);
    expect(result).toBe('test-key-value');
  });
});
