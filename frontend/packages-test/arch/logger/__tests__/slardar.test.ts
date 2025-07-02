import { LogAction, LogLevel } from '../src/types';
import { SlardarReportClient } from '../src/slardar';
vi.mock('@slardar/web');

const captureException = vi.fn();
const sendEvent = vi.fn();
const sendLog = vi.fn();
const mockSlardarInstance = function (type) {
  if (type === 'captureException') {
    captureException();
  }

  if (type === 'sendEvent') {
    sendEvent();
  }

  if (type === 'sendLog') {
    sendLog();
  }
};
describe('slardar reporter client test cases', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  test('slardar init fail', () => {
    const consoleSpy = vi.spyOn(console, 'warn');
    new SlardarReportClient(null);
    expect(consoleSpy).toHaveBeenCalled();
  });

  test('slardar just report persist log', () => {
    const slardarReportClient = new SlardarReportClient(mockSlardarInstance);
    expect(
      slardarReportClient.send({
        action: [LogAction.CONSOLE],
      }),
    ).toBeUndefined();
  });

  test('slardar report error', () => {
    const slardarReportClient = new SlardarReportClient(mockSlardarInstance);
    slardarReportClient.send({
      action: [LogAction.PERSIST],
      level: LogLevel.ERROR,
      meta: {
        reportJsError: true,
      },
    });
    expect(captureException).toHaveBeenCalled();
  });

  test('slardar report event', () => {
    const slardarReportClient = new SlardarReportClient(mockSlardarInstance);
    slardarReportClient.send({
      action: [LogAction.PERSIST],
      level: LogLevel.INFO,
      eventName: 'test-event',
    });
    expect(sendEvent).toHaveBeenCalled();
  });

  test('slardar report log', () => {
    const slardarReportClient = new SlardarReportClient(mockSlardarInstance);
    slardarReportClient.send({
      action: [LogAction.PERSIST],
      level: LogLevel.INFO,
      message: 'test message',
    });
    expect(sendLog).toHaveBeenCalled();
  });
});
