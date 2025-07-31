/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
