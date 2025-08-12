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

import { expect, it, vi } from 'vitest';

import {
  typeSafeJsonParse,
  typeSafeJsonParseEnhanced,
} from '../src/json-parse';

it('simple, parse json', () => {
  const items = [1, true, [], { a: 1 }];
  const empty = () => undefined;
  expect(typeSafeJsonParse(JSON.stringify(items[0]), empty)).toBe(1);
  expect(typeSafeJsonParse(JSON.stringify(items[1]), empty)).toBe(true);
  expect(typeSafeJsonParse(JSON.stringify(items[2]), empty)).toMatchObject(
    items[2],
  );
  expect(typeSafeJsonParse(JSON.stringify(items[3]), empty)).toMatchObject(
    items[3],
  );
});

it('simple, trigger error', () => {
  const onErr = vi.fn();
  expect(typeSafeJsonParse('a', onErr)).toBeNull();
  expect(onErr.mock.calls.length).toBe(1);
});

it('enhanced, parse json', () => {
  const items = [1, true, [], { a: 1 }];
  const getEmpty = () => ({
    onVerifyError: () => undefined,
    onParseError: () => undefined,
    verifyStruct: (sth: unknown): sth is unknown => true,
  });
  expect(
    typeSafeJsonParseEnhanced({
      str: JSON.stringify(items[0]),
      ...getEmpty(),
    }),
  ).toBe(1);
  expect(
    typeSafeJsonParseEnhanced({
      str: JSON.stringify(items[1]),
      ...getEmpty(),
    }),
  ).toBe(true);
  expect(
    typeSafeJsonParseEnhanced({
      str: JSON.stringify(items[2]),
      ...getEmpty(),
    }),
  ).toMatchObject(items[2]);
  expect(
    typeSafeJsonParseEnhanced({
      str: JSON.stringify(items[3]),
      ...getEmpty(),
    }),
  ).toMatchObject(items[3]);
});

it('enhanced, trigger parse error', () => {
  const onParseError = vi.fn();
  expect(
    typeSafeJsonParseEnhanced({
      str: 'ax',
      onParseError,
      onVerifyError: () => undefined,
      verifyStruct: (sth): sth is unknown => true,
    }),
  ).toBeNull();
  expect(onParseError.mock.calls.length).toBe(1);
});

it('enhanced, catch verify not pass error', () => {
  const onVerifyError = vi.fn();
  expect(
    typeSafeJsonParseEnhanced({
      str: 'ax',
      onParseError: () => undefined,
      onVerifyError,
      verifyStruct: (sth): sth is unknown => false,
    }),
  ).toBeNull();
  expect(onVerifyError.mock.calls.length).toBe(1);
  expect(onVerifyError.mock.calls[0][0]).toMatchObject({
    message: 'verify struct no pass',
  });
});

it('enhanced, catch verify broken', () => {
  const onVerifyError = vi.fn();
  expect(
    typeSafeJsonParseEnhanced({
      str: 'ax',
      onParseError: () => undefined,
      onVerifyError,
      verifyStruct: (sth): sth is unknown => {
        const obj = Object(null);
        return 'x' in obj.x;
      },
    }),
  ).toBeNull();
  expect(onVerifyError.mock.calls.length).toBe(1);
  expect(onVerifyError.mock.calls[0][0]).toBeInstanceOf(TypeError);
  expect(onVerifyError.mock.calls[0][0].message).toEqual(
    expect.stringContaining("Cannot use 'in' operator"),
  );
});
