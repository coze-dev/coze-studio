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

import { I18n } from '@coze-arch/i18n';

// 业务代码内部错误码，用于标识业务内的错误。
export enum SDKErrorCode {
  Base = 1000,
  OpenApiUpload = 1001,
  NoClearAPI = 1002,
  StoreProvider = 1003,
  Iframe = 2000,
  IframeParams = 2001,
  Core = 3000,
  NotError = 4000,
}

export class ChatSdkError extends Error {
  sdkCode: SDKErrorCode;

  constructor(options: { sdkCode: SDKErrorCode } | SDKErrorCode) {
    super();
    if (typeof options === 'number') {
      this.sdkCode = options;
    } else {
      this.sdkCode = options.sdkCode;
    }
  }

  static wrap(err: Error, code = SDKErrorCode.Base) {
    const newErr = new ChatSdkError({ sdkCode: code });
    newErr.message = err.message;
    newErr.name = err.name;
    newErr.cause = err.cause;
    newErr.stack = err.stack;

    return newErr;
  }

  static create(sdkCode: SDKErrorCode) {
    return new ChatSdkError({ sdkCode });
  }
}

export interface SDKInitError {
  code: number;
  msg: string;
}

export enum ServerErrorCode {
  BotUnbind = 702242003,
}

export const specCodeList: number[] = [ServerErrorCode.BotUnbind];

export const getServerError = (
  error: SDKInitError,
): SDKInitError | undefined => {
  const code = error?.code;

  switch (code) {
    case ServerErrorCode.BotUnbind:
      return {
        code,
        msg: I18n.t('unbind_notification'),
      };
    default:
  }
};

// coze api中接口返回的错误码
export enum OpenApiError {
  ERROR_FORBIDDEN = 401,
  ERROR_INVALID_TOKEN = 4100,
  ERROR_TOKEN_FORBIDDEN = 4101,
  ERROR_TOKEN_FAILED = 700012006,
  BOT_NOT_PUBLISH = 4015,
}

export const isAuthError = (errorCode: number) =>
  [
    OpenApiError.ERROR_FORBIDDEN,
    OpenApiError.ERROR_INVALID_TOKEN,
    OpenApiError.ERROR_TOKEN_FORBIDDEN,
    OpenApiError.ERROR_TOKEN_FAILED,
  ].includes(errorCode);

export enum ChatSdkErrorType {
  /** botId 错误 */
  INVALID_BOT_ID = 'INVALID_BOT_ID',
  /** OpenAPI 错误 */
  OPEN_API_ERROR = 'OPEN_API_ERROR',
}
export interface ChatSDKErrorData {
  type: ChatSdkErrorType;
  code?: number;
  message?: string;
}

export const postErrorMessage = (data: ChatSDKErrorData) => {
  window.parent.postMessage(
    {
      type: 'chat-sdk-error',
      data,
    },
    '*',
  );
};
