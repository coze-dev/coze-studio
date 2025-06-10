import { getUIModeByBizScene } from '../../src/utils/get-ui-mode-by-biz-scene';

describe('ItemType', () => {
  it('returns UIMode correctly', () => {
    const res1 = getUIModeByBizScene({
      bizScene: 'agentApp',
      showBackground: false,
    });

    const res2 = getUIModeByBizScene({
      bizScene: 'home',
      showBackground: false,
    });

    const res3 = getUIModeByBizScene({
      bizScene: 'agentApp',
      showBackground: false,
    });

    expect(res1).toBe('grey');
    expect(res2).toBe('white');
    expect(res3).toBe('grey');
  });
});
