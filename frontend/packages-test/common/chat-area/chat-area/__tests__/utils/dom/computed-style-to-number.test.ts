import { computedStyleToNumber } from '../../../src/utils/dom/computed-style-to-number';

describe('computedStyleToNumber', () => {
  it('correctly number', () => {
    const res1 = computedStyleToNumber('123123124px');
    const res2 = computedStyleToNumber('1231.4124123px');

    expect(res1).toBe(123123124);
    expect(res2).toBe(1231.4124123);
  });
});
