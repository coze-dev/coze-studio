import { LogLevel, LogAction } from '../src/types';
import {
  getColorByLogLevel,
  ConsoleLogClient,
} from '../src/logger/console-client';

describe('console client test cases', () => {
  test('getColorByLogLevel', () => {
    expect(getColorByLogLevel(LogLevel.SUCCESS)).toBe('#00CC00');
    expect(getColorByLogLevel(LogLevel.WARNING)).toBe('#CC9900');
    expect(getColorByLogLevel(LogLevel.ERROR)).toBe('#CC3333');
    expect(getColorByLogLevel(LogLevel.FATAL)).toBe('#FF0000');
    expect(getColorByLogLevel(LogLevel.INFO)).toBe('#0099CC');
  });
  test('ConsoleLogClient', () => {
    const client = new ConsoleLogClient();
    const logSpy = vi.spyOn(console, 'log');
    expect(
      client.send({
        meta: {},
      }),
    ).toBeUndefined();
    client.send({
      meta: {},
      action: [LogAction.CONSOLE],
      message: 'test',
    });
    expect(logSpy).toHaveBeenCalled();

    client.send({
      action: [LogAction.CONSOLE],
      eventName: 'test',
      scope: 'test scope',
    });
    expect(logSpy).toHaveBeenCalledTimes(2);
  });
});
