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

import { expect, describe, test } from 'vitest';

import { isValidUrl, completeUrl } from '../src/url';

describe('url utils', () => {
  test('isValidUrl', () => {
    expect(isValidUrl('')).toBeFalsy();
    expect(isValidUrl('test.com')).toBeFalsy();
    expect(isValidUrl('http:test.2333.com')).toBeFalsy();
    expect(isValidUrl('https:test.2333.com')).toBeFalsy();
    expect(isValidUrl('http://test.2333.com')).toBeTruthy();
    expect(isValidUrl('https://test.2333.com')).toBeTruthy();
    expect(isValidUrl('https://test.c')).toBeFalsy();
    expect(isValidUrl('https://test.com')).toBeTruthy();
    expect(isValidUrl('https://test.com/')).toBeTruthy();
    expect(isValidUrl('https://test.club')).toBeTruthy();
    expect(
      isValidUrl(
        'https://mock.apifox.com/m1/793747-0-default/get_student_infos?apifoxApiId=159058215',
      ),
    ).toBeTruthy();
  });
  test('completeUrl', () => {
    expect(completeUrl('')).toBe('http://');
    expect(completeUrl('test.com')).toBe('http://test.com');
  });
});
