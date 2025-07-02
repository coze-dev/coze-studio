import { vi } from 'vitest';

vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: vi.fn(),
  },
}));
vi.mock('@coze-arch/logger', () => ({
  logger: {
    info: vi.fn(),
    createLoggerWith: vi.fn(() => ({
      info: vi.fn(),
      persist: {
        error: vi.fn(),
      },
    })),
  },
  reporter: {
    errorEvent: vi.fn(),
    info: vi.fn(),
  },
}));

vi.stubGlobal('IS_OVERSEA', false);
vi.stubGlobal('IS_DEV_MODE', true);
vi.stubGlobal('IS_BOE', true);
