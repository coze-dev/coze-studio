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

import { isError, isObject } from 'lodash-es';
import { type ChatCoreError } from '@coze-common/chat-core';

import { safeJSONParse } from '../../utils/safe-json-parse';

export interface BusinessError {
  code: number;
  msg: string;
}

export const isBusinessError = (value: unknown): value is BusinessError =>
  isObject(value) && 'code' in value && 'msg' in value;

export const isChatCoreError = (error: unknown): error is ChatCoreError =>
  isError(error) && 'ext' in error && 'flatten' in error;

export const parseErrorInfoFromErrorMessage = (message?: string) => {
  if (!message) {
    return;
  }

  const unknownInfo = safeJSONParse(message);
  if (isBusinessError(unknownInfo)) {
    return unknownInfo;
  }
};
export enum ChatBusinessErrorCode {
  SuggestError = 700012051,
  OutTokenLimit = 702232007,
  MENTION_BOT_NOT_FOUND = 700012053,
}

export enum CozeTokenInsufficient {
  COZE_TOKEN_INSUFFICIENT = 702082020,
  COZE_TOKEN_INSUFFICIENT_WORKFLOW = 702095072,
  COZE_TOKEN_INSUFFICIENT_VOICE = 717995023,
  COZE_PRO_TOKEN_INSUFFICIENT_VOICE = 717995024,
}

const TOAST_ERROR_WHITE_LIST = [700012014, 700015002];

export const isToastErrorMessage = (code: number | undefined) => {
  if (IS_OPEN_SOURCE) {
    return true;
  }
  return code && TOAST_ERROR_WHITE_LIST.includes(code);
};

export const CODE_JINJA_FORMAT_ERROR = 700012059;
