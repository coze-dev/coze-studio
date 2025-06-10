import { CustomError, isCustomError } from '../src/custom-error';

describe('bot-error-custom-error', () => {
  test('should create custom-error correctly', () => {
    const eventName = 'custom_error';
    const eventMsg = 'err_msg';
    const customError = new CustomError(eventName, eventMsg);
    expect(customError).toBeInstanceOf(Error);
    expect(customError.name).equal('CustomError');
    expect(customError.eventName).equal(eventName);
    expect(customError.msg).equal(customError.message).equal(eventMsg);
  });

  test('should judge custom-error correctly', () => {
    const nonCustomError = new Error();
    const customError = new CustomError('test', 'test');
    expect(isCustomError(nonCustomError)).toBeFalsy();
    expect(isCustomError(customError)).toBeTruthy();
  });
});
