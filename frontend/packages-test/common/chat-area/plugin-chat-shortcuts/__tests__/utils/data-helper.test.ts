import { type ItemType } from '../../src/utils/data-helper';

describe('ItemType', () => {
  it('returns array item type for array input', () => {
    type Result = ItemType<string[]>;
    const result: Result = 'test';
    expect(typeof result).to.equal('string');
  });

  it('returns same type for non-array input', () => {
    type Result = ItemType<number>;
    const result: Result = 123;
    expect(typeof result).to.equal('number');
  });
});
