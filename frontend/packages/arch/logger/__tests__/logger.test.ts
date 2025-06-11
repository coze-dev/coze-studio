import { type Mock } from 'vitest';

import { Logger } from '../src/logger/logger';
import { shouldCloseConsole } from '../src/console-disable';
import { type SlardarInstance } from '../src';

vi.mock('../src/console-disable');
vi.stubGlobal('IS_RELEASE_VERSION', undefined);

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should create another instance correctly', () => {
    const logger = new Logger();
    const anotherLogger = logger.createLoggerWith({});
    expect(anotherLogger).toBeInstanceOf(Logger);
  });

  test('should trigger disable-console when calling logger.xxx functions', () => {
    const logger = new Logger();
    logger.init({} as unknown as SlardarInstance);

    ['info', 'success', 'warning', 'error'].forEach(fnName => {
      logger[fnName]({ message: 'test' });
      expect(logger.disableConsole).toBe(false);
    });

    logger.setup({ 'no-console': true });
    // create after setup should also inherit no-console
    const logger2 = logger.createLoggerWith({});
    ['info', 'success', 'warning', 'error'].forEach(fnName => {
      (shouldCloseConsole as Mock).mockReturnValue(true);
      logger[fnName]({ message: 'test' });
      logger2[fnName]({ message: 'test' });
      expect(logger.disableConsole).toBe(true);
      expect(logger2.disableConsole).toBe(true);

      (shouldCloseConsole as Mock).mockReturnValue(false);
      logger[fnName]({ message: 'test' });
      logger2[fnName]({ message: 'test' });
      expect(logger.disableConsole).toBe(false);
      expect(logger2.disableConsole).toBe(false);
    });
  });
});
