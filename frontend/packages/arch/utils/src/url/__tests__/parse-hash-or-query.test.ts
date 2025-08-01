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

import { parseHashOrQuery } from '../parse-hash-or-query';

const baseQuery = 'keyA=123&keyB=false&keyC=test&%3F!a=%3F!a';
const expectResult = {
  keyA: '123',
  keyB: 'false',
  keyC: 'test',
  '?!a': '?!a',
};

// The old version of parseHashOrQuery is implemented, verify that the output is consistent.
const parseHashOrQueryOld = (hashFragmentOrQueryString: string) => {
  const targetString =
    hashFragmentOrQueryString.startsWith('#') ||
    hashFragmentOrQueryString.startsWith('?')
      ? hashFragmentOrQueryString.slice(1)
      : hashFragmentOrQueryString;

  const params: Record<string, string> = {};

  const regex = /([^&=]+)=([^&]*)/g;

  let matchResult: RegExpExecArray | null = null;

  // eslint-disable-next-line no-cond-assign
  while ((matchResult = regex.exec(targetString))) {
    const [, key, value] = matchResult;
    params[decodeURIComponent(key)] = decodeURIComponent(value);
  }

  return params;
};

describe('parseHashOrQuery', () => {
  it('parse query string starts with `?`', () => {
    const query = `?${baseQuery}`;
    const newRes = parseHashOrQuery(query);
    expect(newRes).toEqual(expectResult);
    expect(parseHashOrQueryOld(query)).toEqual(newRes);
  });

  it('parse hash starts with `#`', () => {
    const query = `#${baseQuery}`;
    const newRes = parseHashOrQuery(query);
    expect(newRes).toEqual(expectResult);
    expect(parseHashOrQueryOld(query)).toEqual(newRes);
  });

  it('parse plain string', () => {
    const newRes = parseHashOrQuery(baseQuery);
    expect(newRes).toEqual(expectResult);
    expect(parseHashOrQueryOld(baseQuery)).toEqual(newRes);
  });
});
