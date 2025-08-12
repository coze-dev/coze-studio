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

const policyExceptionCodeList = [
  /** Risk control interception */
  '700012014',
];

/**
 * Temporarily distinguish whether the chat area inits an abnormal risk control strategy
 * In the future, you need to configure the interceptor thrown by the exception in chatCore
 */
export const getIsPolicyException = (error: Error) => {
  /**
   * At present, the external chat area init methods have all gone. The error thrown after the xxxAPI exception of the business encapsulation is APIError in the shape of
   * constructor(
   *  public code: string,
   *  public msg: string | undefined,
   * )
   */
  if ('code' in error) {
    return policyExceptionCodeList.includes(String(error.code));
  }
  return false;
};
