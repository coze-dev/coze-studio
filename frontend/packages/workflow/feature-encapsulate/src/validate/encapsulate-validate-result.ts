import { injectable } from 'inversify';

import {
  type EncapsulateValidateResult,
  type EncapsulateValidateErrorCode,
  type EncapsulateValidateError,
} from './types';

@injectable()
export class EncapsulateValidateResultImpl
  implements EncapsulateValidateResult
{
  private errors: Map<string, EncapsulateValidateError[]> = new Map();
  addError(error: EncapsulateValidateError) {
    if (!this.errors.has(error.code)) {
      this.errors.set(error.code, []);
    }
    const errors = this.errors.get(error.code);
    if (errors && !errors.some(item => item.source === error.source)) {
      errors.push(error);
    }
  }

  getErrors() {
    return [...this.errors.values()].flat();
  }

  hasError() {
    return this.errors.size > 0;
  }

  hasErrorCode(code: EncapsulateValidateErrorCode) {
    return this.errors.has(code);
  }
}
