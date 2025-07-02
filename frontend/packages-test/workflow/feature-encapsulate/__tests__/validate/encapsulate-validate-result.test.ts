import { describe, it, expect } from 'vitest';

import { createContainer } from '../create-container';
import {
  EncapsulateValidateResultFactory,
  type EncapsulateValidateResult,
  EncapsulateValidateErrorCode,
} from '../../src/validate';

describe('EncapsulateValidateResult', () => {
  let encapsulateValidateResult: EncapsulateValidateResult;
  let encapsulateValidateResultFactory: EncapsulateValidateResultFactory;
  beforeEach(() => {
    const container = createContainer();
    encapsulateValidateResultFactory =
      container.get<EncapsulateValidateResultFactory>(
        EncapsulateValidateResultFactory,
      );
    encapsulateValidateResult = encapsulateValidateResultFactory();
  });

  it('should be defined', () => {
    expect(encapsulateValidateResult).toBeDefined();
  });

  it('should be different instance', () => {
    expect(encapsulateValidateResultFactory()).not.toBe(
      encapsulateValidateResult,
    );
  });

  it('should add error', () => {
    encapsulateValidateResult.addError({
      code: EncapsulateValidateErrorCode.NO_START_END,
      message: 'test',
    });
    expect(encapsulateValidateResult.hasError()).toBeTruthy();
  });

  it('should add different source error', () => {
    encapsulateValidateResult.addError({
      code: EncapsulateValidateErrorCode.NO_START_END,
      message: 'test',
    });

    encapsulateValidateResult.addError({
      code: EncapsulateValidateErrorCode.NO_START_END,
      message: 'test',
      source: '1',
    });
    expect(encapsulateValidateResult.getErrors()).toMatchSnapshot();
  });

  it('should get errors', () => {
    encapsulateValidateResult.addError({
      code: EncapsulateValidateErrorCode.NO_START_END,
      message: 'test',
    });
    expect(encapsulateValidateResult.getErrors()).toMatchSnapshot();
  });

  it('should has error code', () => {
    encapsulateValidateResult.addError({
      code: EncapsulateValidateErrorCode.NO_START_END,
      message: 'test',
    });
    expect(
      encapsulateValidateResult.hasErrorCode(
        EncapsulateValidateErrorCode.NO_START_END,
      ),
    ).toBeTruthy();
  });
});
