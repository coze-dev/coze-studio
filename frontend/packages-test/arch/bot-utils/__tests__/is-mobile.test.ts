import { isMobile } from '../src/is-mobile';

describe('is-mobile', () => {
  const TARGET_WIDTH = 640;
  test('isMobile with false', () => {
    vi.stubGlobal('document', {
      documentElement: {
        clientWidth: TARGET_WIDTH + 10,
      },
    });
    expect(isMobile()).toBeFalsy();
  });

  test('isMobile with true', () => {
    vi.stubGlobal('document', {
      documentElement: {
        clientWidth: TARGET_WIDTH - 10,
      },
    });
    expect(isMobile()).toBeTruthy();
  });
});
