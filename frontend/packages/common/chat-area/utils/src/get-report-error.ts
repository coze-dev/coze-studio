import { isObject } from 'lodash-es';

/**
 * @param inputError 传啥都行，一般是 catch (e) 那个 e
 * @param reason 多余的解释，我感觉有 eventName 了没啥用
 */
export const getReportError = (
  inputError: unknown,
  reason?: string,
): {
  error: Error;
  meta: Record<string, unknown>;
} => {
  if (inputError instanceof Error) {
    return {
      error: inputError,
      meta: { reason },
    };
  }
  if (!isObject(inputError)) {
    return {
      error: new Error(String(inputError)),
      meta: { reason },
    };
  }
  return {
    error: new Error(''),
    meta: { ...covertInputObject(inputError), reason },
  };
};

const covertInputObject = (inputError: object) => {
  if ('reason' in inputError) {
    return {
      ...inputError,
      reasonOfInputError: inputError.reason,
    };
  }
  return inputError;
};
