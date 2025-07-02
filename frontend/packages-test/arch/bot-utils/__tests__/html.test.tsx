import { type ReactNode } from 'react';

import { renderHtmlTitle } from '../src/html';

vi.mock('@coze-arch/i18n', () => ({
  I18n: { t: vi.fn(k => k) },
}));

describe('html', () => {
  test('renderHtmlTitle', () => {
    expect(renderHtmlTitle('test')).equal('test - platform_name');
    expect(renderHtmlTitle({} as unknown as ReactNode)).equal('platform_name');
  });
});
