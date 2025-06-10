import { getReportError } from '../src/get-report-error';

describe('getReportError', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('common error', () => {
    const error = new Error('123');
    const result = getReportError(error, 'testError');
    expect(result).toMatchObject({ error, meta: { reason: 'testError' } });
  });

  test('stringify error', () => {
    const result = getReportError('123', 'testError');
    expect(result).toMatchObject({
      error: new Error('123'),
      meta: { reason: 'testError' },
    });
  });

  test('object error', () => {
    const result = getReportError(
      { foo: 'bar', reason: 'i am fool' },
      'testError',
    );
    expect(result).toMatchObject({
      error: new Error(''),
      meta: { reason: 'testError', reasonOfInputError: 'i am fool' },
    });
  });
});
