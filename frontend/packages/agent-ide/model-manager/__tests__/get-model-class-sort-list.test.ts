import { getModelClassSortList } from '../src/utils/model/get-model-class-sort-list';

vi.mock('@coze-studio/bot-detail-store', () => ({}));

describe('get-model-class-sort-list', () => {
  it('should sort correctly', () => {
    const res = getModelClassSortList([
      '1',
      '1',
      '3',
      '11',
      '3',
      '3',
      '1',
      '1',
      '1',
      '1',
      '5',
      '1',
      '11',
      '3',
      '5',
      '1',
    ]);
    expect(res).toStrictEqual(['1', '3', '11', '5']);
  });
});
