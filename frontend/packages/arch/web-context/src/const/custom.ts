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
 
// extract from apps/bot/src/constant/custom.ts

const enum CozeTokenInsufficientErrorCode {
  WORKFLOW = '702095072',
  BOT = '702082020',
}
/**
 * Coze Token不足错误码
 * 当出现该错误码的时候，需要额外进行停止拉流操作
 */
export const COZE_TOKEN_INSUFFICIENT_ERROR_CODE = [
  CozeTokenInsufficientErrorCode.BOT,
  CozeTokenInsufficientErrorCode.WORKFLOW,
];
