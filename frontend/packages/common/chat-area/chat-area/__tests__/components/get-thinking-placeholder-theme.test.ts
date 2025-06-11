import { getThinkingPlaceholderTheme } from '../../src/utils/components/get-thinking-placeholder-theme';

describe('test get thinking placeholder theme', () => {
  it('not enable UIKit Coze Design', () => {
    const theme = getThinkingPlaceholderTheme({
      bizTheme: 'home',
    });
    expect(theme).toBe('whiteness');
  });

  it('enable UIKit Coze Design', () => {
    const theme1 = getThinkingPlaceholderTheme({
      bizTheme: 'home',
    });
    expect(theme1).toBe('whiteness');
    const theme2 = getThinkingPlaceholderTheme({
      bizTheme: 'debug',
    });
    const theme3 = getThinkingPlaceholderTheme({
      bizTheme: 'store',
    });
    expect(theme2).toBe('grey');
    expect(theme3).toBe('grey');
  });
});
