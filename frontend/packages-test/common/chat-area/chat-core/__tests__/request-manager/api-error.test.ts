import { ApiError, isApiError } from '@/request-manager/api-error';

describe('ApiError', () => {
  it('constructs correctly with given parameters', () => {
    const response = {
      data: { code: '404', msg: 'Not Found' },
      config: {},
      request: {},
      headers: { 'x-tt-logid': '1234567890' },
    };
    const error = new ApiError('404', 'Not Found', response);

    expect(error.code).toBe('404');
    expect(error.msg).toBe('Not Found');
    expect(error.raw).toEqual({ code: '404', msg: 'Not Found' });
    expect(error.logId).toBe('1234567890');
    expect(error.type).toBe('Api Response Error');
  });

  it('handles missing headers gracefully', () => {
    const response = {
      data: { code: '500', msg: 'Internal Server Error' },
      config: {},
      request: {},
      headers: {},
    };
    const error = new ApiError('500', 'Internal Server Error', response);

    expect(error.logId).toBeUndefined();
  });

  it('overrides error name as ApiError', () => {
    const response = {
      data: { code: '400', msg: 'Bad Request' },
      config: {},
      request: {},
      headers: {},
    };
    const error = new ApiError('400', 'Bad Request', response);

    expect(error.name).toBe('ApiError');
  });
});

describe('isApiError', () => {
  it('returns true when given an ApiError instance', () => {
    const response = {
      data: { code: '403', msg: 'Forbidden' },
      config: {},
      request: {},
      headers: {},
    };
    const error = new ApiError('403', 'Forbidden', response);

    const result = isApiError(error);
    expect(result).toBe(true);
  });

  it('returns false when given a generic Error instance', () => {
    const error = new Error('Some error');

    const result = isApiError(error);
    expect(result).toBe(false);
  });
});
