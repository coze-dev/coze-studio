import { expect, it } from 'vitest';

import {
  sortInt64CompareFn,
  getIsDiffWithinRange,
  getMinMax,
  compareInt64,
  getInt64AbsDifference,
} from '../src/int64';

it('正确排序', () => {
  expect(['123', '3', '02', '01234'].sort(sortInt64CompareFn)).toMatchObject([
    '02',
    '3',
    '123',
    '01234',
  ]);
});

it('计算两个数字差值小于范围', () => {
  expect(getIsDiffWithinRange('1234567', '12345678923456745678', 50)).toBe(
    false,
  );
  expect(
    getIsDiffWithinRange('12345678923456745679', '12345678923456745678', 50),
  ).toBe(true);
});

it('get min max', () => {
  expect(getMinMax('1', '3', '2', '5')).toMatchObject({ min: '1', max: '5' });
  expect(getMinMax('3', '2', '5')).toMatchObject({ min: '2', max: '5' });
  expect(getMinMax('3', '2', '1')).toMatchObject({ min: '1', max: '3' });
  expect(getMinMax('3')).toMatchObject({ min: '3', max: '3' });
  expect(getMinMax()).toBeNull();
});

it('compare right', () => {
  expect(compareInt64('1').greaterThan('0')).toBe(true);
  expect(compareInt64('1').lesserThan('10')).toBe(true);
  expect(compareInt64('1').eq('1')).toBe(true);
});

it('get diff right', () => {
  expect(getInt64AbsDifference('10', '200')).toBe(190);
});
