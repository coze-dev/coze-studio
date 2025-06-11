import { isApiError } from '../../src/utils/handle-error';

describe('isApiError', () => {
  it('identifies ApiError correctly', () => {
    const error = { name: 'ApiError' };
    const result = isApiError(error);
    expect(result).to.be.true;
  });

  it('returns false for non-ApiError', () => {
    const error = { name: 'OtherError' };
    const result = isApiError(error);
    expect(result).to.be.false;
  });

  it('returns false for error without name', () => {
    const error = { message: 'An error occurred' };
    const result = isApiError(error);
    expect(result).to.be.false;
  });

  it('handles null and undefined', () => {
    expect(isApiError(null)).to.be.false;
    expect(isApiError(undefined)).to.be.false;
  });
});
