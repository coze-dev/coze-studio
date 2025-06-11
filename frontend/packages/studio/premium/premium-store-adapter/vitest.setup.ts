vi.stubGlobal('IS_DEV_MODE', false);

vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: vi.fn(),
  },
}));

vi.mock('@coze-arch/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));
