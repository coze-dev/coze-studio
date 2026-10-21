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

import { describe, it, expect, vi } from 'vitest';

import { I18n, initI18nInstance, loadI18nResources } from '../../src/raw';

const { loadLocaleRu } = vi.hoisted(() => ({
  loadLocaleRu: vi.fn(() => Promise.resolve({ test: 'Тест' })),
}));

vi.mock('../../src/resource.ts', () => ({
  default: {
    en: { i18n: { test: 'Test', only_en: 'Only in English' } },
    'zh-CN': { i18n: { test: '测试' } },
  },
}));
vi.mock('@coze-studio/studio-i18n-resource-adapter', () => ({
  loadLocaleRu,
}));

// The tests share the module state (the downloaded ru resources) and run in
// order: the first download fails, the next one succeeds.
describe('loadI18nResources', () => {
  it('should not download anything for bundled languages', async () => {
    expect(await loadI18nResources('en')).toBe(true);
    expect(await loadI18nResources('zh-CN')).toBe(true);
    expect(loadLocaleRu).not.toHaveBeenCalled();
  });

  it('should resolve to false when the download fails and retry on the next call', async () => {
    const error = new Error('Loading chunk failed');
    loadLocaleRu.mockRejectedValueOnce(error);
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    expect(await loadI18nResources('ru-RU')).toBe(false);
    expect(consoleError).toHaveBeenCalledWith(expect.any(String), error);
    consoleError.mockRestore();

    // The app then starts in English
    await initI18nInstance({ lng: 'en' });
    expect(I18n.t('test')).toEqual('Test');

    // Concurrent and repeated calls share one download
    expect(
      await Promise.all([loadI18nResources('ru-RU'), loadI18nResources('ru')]),
    ).toEqual([true, true]);
    expect(await loadI18nResources('ru-RU')).toBe(true);
    expect(loadLocaleRu).toHaveBeenCalledTimes(2);
  });

  it('should add ru to an initialized instance', async () => {
    // Loaded after init by the previous test
    await I18n.setLangWithPromise('ru-RU');

    expect(I18n.t('test')).toEqual('Тест');
    expect(I18n.t('only_en')).toEqual('Only in English');
  });

  it('should pass the loaded ru to a later init', async () => {
    await initI18nInstance({ lng: 'ru-RU' });

    expect(I18n.i18nInstance.instance.resolvedLanguage).toEqual('ru');
    expect(I18n.t('test')).toEqual('Тест');
    expect(I18n.t('only_en')).toEqual('Only in English');
    expect(loadLocaleRu).toHaveBeenCalledTimes(2);
  });
});
