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

import {
  type FetchSteamConfig,
  FetchStreamErrorCode,
  type FetchStreamErrorInfo,
  type FetchStreamError,
} from './type';

export async function onStart(
  response: Response,
  inputOnStart: FetchSteamConfig<unknown, unknown>['onStart'],
): Promise<void> {
  await inputOnStart?.(response);

  if (!(response.ok && response.body)) {
    throw new Error(`Invalid Response, ResponseStatus: ${response.status}`);
  }
}

export function validateChunk(decodedChunk: string): void {
  let json: unknown;
  try {
    json = JSON.parse(decodedChunk);
    // eslint-disable-next-line @coze-arch/no-empty-catch, @coze-arch/use-error-in-catch -- designed like this
  } catch {
    /**
     * Catch JSON.parse errors here without any processing
     * It is normal for normal streaming to return json parsing failure.
     */
  }

  if (
    typeof json === 'object' &&
    json !== null &&
    'code' in json &&
    json.code !== 0
  ) {
    throw json;
  }
}

export function isFetchStreamErrorInfo(
  error: unknown,
): error is FetchStreamErrorInfo {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'msg' in error
  );
}

export function getStreamingErrorInfo(error: unknown): FetchStreamError {
  let errorMsg =
    'An exception occurred during the process of dealing with HTTP chunked streaming response.';
  let errorCode = FetchStreamErrorCode.HttpChunkStreamingException;

  if (error instanceof Error) {
    errorMsg = error.message;
  }

  if (isFetchStreamErrorInfo(error)) {
    errorMsg = error.msg;
    errorCode = error.code;
  }

  return {
    msg: errorMsg,
    code: errorCode,
    error,
  };
}

export function getFetchErrorInfo(error: unknown): FetchStreamError {
  const errorMsg = 'An exception occurred during the fetch';
  const errorCode = FetchStreamErrorCode.FetchException;

  return {
    msg: error instanceof Error ? error.message : errorMsg,
    code: errorCode,
    error,
  };
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}
