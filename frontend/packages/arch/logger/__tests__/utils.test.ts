import { ErrorType } from '../src/types';
import {
  safeJson,
  ApiError,
  getErrorType,
  getApiErrorRecord,
} from '../src/slardar/utils';

describe('slardar utils function is normal', () => {
  test('safeJson stringify and parse success catch error', () => {
    const mock = {
      test: {},
    };
    mock.test = mock;

    expect(safeJson.stringify(mock)).toContain('JSON stringify Error:');

    expect(safeJson.parse('{')).toBeNull();
  });

  test('ApiError', () => {
    const apiError = new ApiError({
      httpStatus: '200',
      code: '0',
      message: 'test',
      logId: '123',
    });
    expect(apiError.name).toBe('ApiError');
  });

  test('getErrorType', () => {
    const errorType = getErrorType({
      name: '',
      message: '',
    });
    expect(errorType).toBe(ErrorType.Unknown);

    const errorType1 = getErrorType(null);
    expect(errorType1).toBe(ErrorType.Unknown);

    const apiError = new ApiError({
      httpStatus: '200',
      code: '0',
      message: 'test',
      logId: '123',
    });
    const errorType2 = getErrorType(apiError);
    expect(errorType2).toBe(ErrorType.ApiError);

    const apiError2 = new ApiError({
      httpStatus: '200',
      code: '0',
      message: 'test',
      logId: '123',
      errorType: 'test',
    });

    const errorType3 = getErrorType(apiError2);
    expect(errorType3).toBe('test');
  });

  test('getApiErrorRecord', () => {
    const error1 = getApiErrorRecord(null);
    expect(error1).toEqual({});

    const apiError = new ApiError({
      httpStatus: '200',
      code: '0',
      message: 'test',
      logId: '123',
      response: {},
      requestConfig: {},
    });
    const error2 = getApiErrorRecord(apiError);
    expect(error2.response).toBe('{}');
  });
});
