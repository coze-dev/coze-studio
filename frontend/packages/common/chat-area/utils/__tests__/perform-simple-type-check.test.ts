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

import { expect, it } from 'vitest';

import { performSimpleObjectTypeCheck } from '../src/perform-simple-type-check';

it('check simple obj', () => {
  expect(
    performSimpleObjectTypeCheck(
      {
        a: 1,
        b: '2',
      },
      [
        ['a', 'is-number'],
        ['b', 'is-string'],
      ],
    ),
  ).toBe(true);
});

it('not block', () => {
  expect(performSimpleObjectTypeCheck([], [])).toBe(true);
  expect(
    performSimpleObjectTypeCheck(
      {
        a: 1,
      },
      [],
    ),
  ).toBe(true);
  expect(
    performSimpleObjectTypeCheck(
      {
        a: 1,
        b: '2',
      },
      [['a', 'is-string']],
    ),
  ).toBe(false);
});

it('only check object', () => {
  expect(performSimpleObjectTypeCheck(1, [])).toBe(false);
  expect(performSimpleObjectTypeCheck('1', [])).toBe(false);
  expect(performSimpleObjectTypeCheck(null, [])).toBe(false);
  expect(performSimpleObjectTypeCheck(undefined, [])).toBe(false);
});

it('check key exists', () => {
  expect(performSimpleObjectTypeCheck({}, [['a', 'is-string']])).toBe(false);
});
