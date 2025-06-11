import 'reflect-metadata';
vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: vi.fn(),
  },
}));
vi.mock('@coze-arch/bot-flags', () => ({
  getFlags: () => ({
    'bot.automation.encapsulate': true,
  }),
}));
vi.mock('@coze/coze-design', () => ({
  Typography: {
    Text: vi.fn(),
  },
  withField: vi.fn(),
}));
vi.mock('@coze-workflow/components', () => ({}));

vi.stubGlobal('IS_DEV_MODE', true);
vi.stubGlobal('IS_OVERSEA', false);
vi.stubGlobal('IS_BOE', false);
vi.stubGlobal('REGION', 'cn');
