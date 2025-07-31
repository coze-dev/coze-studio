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

import { appendUrlParam, getParamsFromQuery, openUrl } from '../src/url';
import { getIsMobile, getIsSafari } from '../src/platform';

vi.mock('../src/platform', () => ({
  getIsMobile: vi.fn(),
  getIsSafari: vi.fn(),
}));

const mockParseQuery = (queryStr: string) =>
  Object.fromEntries(
    queryStr
      .split('&')
      .map(str => {
        const parts = str.split('=');
        return [parts[0] ?? '', parts?.[1] ?? ''];
      })
      .filter(entries => !!entries[0]),
  );
vi.mock('query-string', () => ({
  default: {
    parseUrl: (url: string) => {
      const [rawUrl, queryStr = ''] = url.split('?');
      return {
        url: rawUrl,
        query: mockParseQuery(queryStr),
      };
    },
    parse: (queryStr: string) => mockParseQuery(queryStr.slice(1)),
    stringifyUrl: ({ url, query }: { url: string; query: string }) =>
      `${url}${Object.entries(query).length ? '?' : ''}${Object.entries(query)
        .map(entry => entry.join('='))
        .join('&')}`,
  },
}));

describe('URL', () => {
  beforeEach(() => {
    vi.stubGlobal('location', { href: '' });
    vi.stubGlobal('window', {
      open: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('#getParamsFromQuery', () => {
    vi.stubGlobal('location', { search: '' });
    expect(getParamsFromQuery({ key: '' })).toEqual('');
    expect(getParamsFromQuery({ key: 'a' })).toEqual('');

    vi.stubGlobal('location', { search: '?a=b' });
    expect(getParamsFromQuery({ key: '' })).toEqual('');
    expect(getParamsFromQuery({ key: 'a' })).toEqual('b');
  });

  it('#appendUrlParam', () => {
    expect(appendUrlParam('http://test.com', 'k1', 'v1')).equal(
      'http://test.com?k1=v1',
    );
    expect(appendUrlParam('http://test.com?k1=v1', 'k2', 'v2')).equal(
      'http://test.com?k1=v1&k2=v2',
    );
    expect(appendUrlParam('http://test.com?k1=v1', 'k1', '')).equal(
      'http://test.com',
    );
  });

  it('#openUrl', () => {
    openUrl(undefined);
    expect(window.open).not.toHaveBeenCalled();
    expect(location.href).toBe('');

    vi.mocked(getIsMobile).mockReturnValue(true);
    vi.mocked(getIsSafari).mockReturnValue(true);

    openUrl('https://example.com');

    expect(location.href).toBe('https://example.com');
    expect(window.open).not.toHaveBeenCalled();
  });
});
