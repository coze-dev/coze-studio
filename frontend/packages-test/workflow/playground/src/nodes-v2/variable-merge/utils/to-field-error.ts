import { type FieldError } from '@flowgram-adapter/free-layout-editor';

/**
 * 转成Filed错误
 * @param name
 * @param message
 * @returns
 */
export function toFieldError(name: string, message: string): FieldError {
  return {
    name,
    level: 'error',
    message,
  } as unknown as FieldError;
}
