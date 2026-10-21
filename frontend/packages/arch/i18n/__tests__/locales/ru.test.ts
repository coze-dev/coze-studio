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

import { describe, it, expect, beforeAll } from 'vitest';
import {
  defaultConfig,
  loadLocaleRu,
  localeEn,
  localeZhCN,
} from '@coze-studio/studio-i18n-resource-adapter';

import { I18n, initI18nInstance, loadI18nResources } from '../../src/raw';

// The part of intl-messageformat that i18next-icu puts on the i18next
// instance (i18next.IntlMessageFormat) and formats every text with.
interface MessageElement {
  type: number;
  value?: unknown;
  options?: Record<string, { value: MessageElement[] }>;
  children?: MessageElement[];
}
interface Message {
  format: (values?: Record<string, unknown>) => unknown;
  getAst: () => MessageElement[];
}
type MessageFormatConstructor = new (
  message: string,
  locales: string,
  formats?: unknown,
  opts?: { ignoreTag?: boolean },
) => Message;

// Element types (TYPE) of @formatjs/icu-messageformat-parser
const AST_TYPE = {
  argument: 1,
  number: 2,
  date: 3,
  time: 4,
  select: 5,
  plural: 6,
} as const;
const ARGUMENT_TYPES = new Set<number>(Object.values(AST_TYPE));
const NUMERIC_TYPES = new Set<number>([AST_TYPE.number, AST_TYPE.plural]);
// Counts that hit the one, few and many branches of Russian plurals
const PLURAL_COUNTS = [1, 2, 5, 21];
const HAN = /\p{Script=Han}/u;

// ru keys whose arguments differ from the reference on purpose; the code
// passes all of them
const RU_ARGUMENTS: Record<string, string[]> = {
  // en drops the page numbers that the code passes as filterPages
  data_filter_values: ['filterPages'],
  // the code always passes key_name: 'token', so ru names the token in words
  bot_publish_bind_error: ['bot_name'],
};

const collectArguments = (
  elements: MessageElement[],
  args = new Map<string, number>(),
) => {
  for (const element of elements) {
    const name = String(element.value);
    if (
      ARGUMENT_TYPES.has(element.type) &&
      (!args.has(name) || NUMERIC_TYPES.has(element.type))
    ) {
      args.set(name, element.type);
    }
    for (const option of Object.values(element.options ?? {})) {
      collectArguments(option.value, args);
    }
    collectArguments(element.children ?? [], args);
  }
  return args;
};

const sampleValue = (type: number, count: number) => {
  if (NUMERIC_TYPES.has(type)) {
    return count;
  }
  if (type === AST_TYPE.date || type === AST_TYPE.time) {
    return new Date(2026, 0, 2);
  }
  return 'x';
};

const en: Record<string, string> = localeEn;
const zh: Record<string, string> = localeZhCN;

describe('ru locale', () => {
  let ru: Record<string, string> = {};
  let createMessage: (message: string, lng: string) => Message;

  beforeAll(async () => {
    expect(await loadI18nResources('ru-RU')).toBe(true);
    await initI18nInstance({ lng: 'ru-RU' });
    ru = await loadLocaleRu();
    const instance = I18n.i18nInstance.instance as unknown as Record<
      string,
      MessageFormatConstructor
    >;
    createMessage = (message, lng) =>
      new instance.IntlMessageFormat(message, lng, undefined, {
        ignoreTag: true,
      });
  });

  it('should load ru on demand instead of bundling it', () => {
    expect(Object.keys(defaultConfig)).toEqual(['en', 'zh-CN']);
    expect(ru.settings_language_ru).toEqual(expect.any(String));
    expect(ru.settings_language_ru).not.toEqual('');
    expect(localeEn.settings_language_ru).toEqual('Russian');
    expect(localeZhCN.settings_language_ru).toEqual('俄语');
  });

  it('should resolve ru-RU to the ru resource', () => {
    expect(I18n.language).toEqual('ru-RU');
    expect(I18n.i18nInstance.instance.resolvedLanguage).toEqual('ru');
    expect(I18n.t('settings_language_ru')).toEqual(ru.settings_language_ru);
  });

  it('should fall back from ru to en', () => {
    expect(I18n.i18nInstance.instance.languages).toEqual(['ru-RU', 'ru', 'en']);

    const key = 'ru_test_key_only_in_en';
    I18n.addResourceBundle('en', 'i18n', { [key]: 'Only in English' });
    expect(I18n.t(key)).toEqual('Only in English');
  });

  it('should contain no Han characters', () => {
    expect(Object.keys(ru).filter(key => HAN.test(ru[key]))).toEqual([]);
  });

  it('should format every text and keep the arguments of en', () => {
    const problems: string[] = [];
    for (const [key, value] of Object.entries(ru)) {
      // keys that en lacks come from zh-CN
      const reference = key in en ? en[key] : zh[key];
      if (reference === undefined) {
        problems.push(`${key}: not in en or zh-CN`);
        continue;
      }
      let args: Map<string, number>;
      try {
        const message = createMessage(value, 'ru');
        args = collectArguments(message.getAst());
        for (const count of PLURAL_COUNTS) {
          message.format(
            Object.fromEntries(
              [...args].map(([name, type]) => [name, sampleValue(type, count)]),
            ),
          );
        }
      } catch (error) {
        problems.push(`${key}: ${String(error)}`);
        continue;
      }
      let expected = RU_ARGUMENTS[key];
      if (!expected) {
        try {
          expected = [
            ...collectArguments(createMessage(reference, 'en').getAst()).keys(),
          ];
        } catch (error) {
          // The reference itself is not valid ICU, there is nothing to compare
          if (!(error instanceof SyntaxError)) {
            throw error;
          }
          continue;
        }
      }
      const actual = [...args.keys()];
      if ([...expected].sort().join() !== [...actual].sort().join()) {
        problems.push(`${key}: arguments [${actual}] instead of [${expected}]`);
      }
    }
    expect(problems).toEqual([]);
  });
});
