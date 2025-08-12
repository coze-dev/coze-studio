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
