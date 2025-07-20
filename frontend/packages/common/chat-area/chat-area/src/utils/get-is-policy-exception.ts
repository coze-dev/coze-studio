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
  /** 风控拦截 */
  '700012014',
];

/**
 * 临时为 chat area init 区分是否为风控策略异常
 * 后续需要在 chatCore 配置异常抛出的拦截器
 */
export const getIsPolicyException = (error: Error) => {
  /**
   * 目前外部 chat area init 方法都走了业务封装的 xxxAPI 异常后抛出的错误为 APIError 形状为
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
