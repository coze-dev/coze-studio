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
 
/* eslint-disable @typescript-eslint/naming-convention */
export enum CommonError {
  /** webpack chunk load 失败 */
  ChunkLoadError = 'chunk_load_error',
  /** 参数校验类错误 */
  parmasValidation = 'parmas_validation',
  /** 返回结果 校验错误的 */
  responseValidation = 'response_validation',
  /** 错误 path */
  errorPath = 'error_path',
  /** fws 抛出的错误 */
  fwsError = 'fws_error',
  /** get tokens 初始化 */
  getTokenInit = 'get_token_init',
  /** get tokens get encode */
  getTokenEncode = 'get_token_encode',
  /** get tokens 错误 */
  getTokenError = 'get_token_error',
  /** 表单校验 error */
  formValidation = 'form_validation',
  /** 第三方登录失败 */
  thirdPartyAuth = 'third_party_auth',
  /** 用于常规的 Error */
  normalError = 'normal_error',
  /** 获取 bot diff error */
  getBotDiffError = 'get_bot_diff_error',
  /** merge bot diff error */
  mergeBotDiffError = 'merge_bot_diff_error',
}
