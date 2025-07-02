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
