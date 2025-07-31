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

import { LogLevel, type ApiErrorOption, ErrorType } from '../types';

function isObject<T>(it: T): it is object extends T
  ? // Narrow the `{}` type to an unspecified object
    T & Record<string | number | symbol, unknown>
  : unknown extends T
  ? // treat unknown like `{}`
    T & Record<string | number | symbol, unknown>
  : T extends object // function, array or actual object
  ? T extends readonly unknown[]
    ? never // not an array
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends (...args: any[]) => any
    ? never // not a function
    : T // no, an actual object
  : never {
  // This is necessary because:
  // typeof null === 'object'
  // typeof [] === 'object'
  // [] instanceof Object === true
  return Object.prototype.toString.call(it) === '[object Object]';
}

export function toFlatPropertyMap(
  inputObj: Record<string, unknown>,
  options?: {
    keySeparator?: string;
    maxDepth?: number;
  },
) {
  const { keySeparator = '.', maxDepth } = options || {};
  const flattenRecursive = (
    obj: Record<string, unknown>,
    propertyMap: Record<string, unknown>,
    depth = 1,
    parentKey?: string,
    // eslint-disable-next-line max-params
  ) => {
    for (const [key, value] of Object.entries(obj)) {
      const path = parentKey ? `${parentKey}${keySeparator}${key}` : key;
      const currentDepth = depth + 1;
      if (value && isObject(value) && (!maxDepth || currentDepth <= maxDepth)) {
        flattenRecursive(value, propertyMap, currentDepth, path);
      } else {
        propertyMap[path] = value;
      }
    }
    return propertyMap;
  };

  const result: Record<string, unknown> = {};
  return flattenRecursive(inputObj, result);
}

export const safeJson = (() => {
  const stringify = (sth: unknown): string => {
    try {
      return JSON.stringify(sth);
    } catch (e) {
      console.error(e);
      return `JSON stringify Error: ${(e as Error).message}`;
    }
  };

  const parse = (sth?: string) => {
    try {
      return JSON.parse(sth || '');
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  return {
    stringify,
    parse,
  };
})();

export class ApiError extends Error {
  errorOption: ApiErrorOption;

  constructor(option: ApiErrorOption) {
    super(
      `httpStatus=${option.httpStatus}, code=${option.code}, message=${option.message}, logId=${option.logId}`,
    );
    this.name = 'ApiError';
    this.errorOption = option;
  }
}

export const getErrorType = (error?: ApiError | Error): string => {
  if (!error) {
    return ErrorType.Unknown;
  }

  if (error instanceof ApiError) {
    // Preferentially use the API error type given by the business
    if (error.errorOption?.errorType) {
      return error.errorOption.errorType;
    }
    return ErrorType.ApiError;
  }

  return ErrorType.Unknown;
};

export const getApiErrorRecord = (
  error: ApiError | Error,
): Record<string, unknown> => {
  if (error instanceof ApiError && error.errorOption) {
    const { errorOption } = error;
    return {
      httpStatus: errorOption.httpStatus,
      code: errorOption.code,
      logId: errorOption.logId,
      response: safeJson.stringify(errorOption.response),
      requestConfig: safeJson.stringify(errorOption.requestConfig),
    };
  }
  return {};
};

export const getErrorRecord = (
  error?: ApiError | Error,
): Record<string, string | number | undefined> => {
  if (!error) {
    return {};
  }
  return {
    ...getApiErrorRecord(error),
    message: error.message,
    stack: error.stack,
    type: getErrorType(error),
  };
};

const levelMap = {
  [LogLevel.INFO]: 'info',
  [LogLevel.SUCCESS]: 'success',
  [LogLevel.WARNING]: 'warn',
  [LogLevel.ERROR]: 'error',
  [LogLevel.FATAL]: 'fatal',
};
export function getLogLevel(level = LogLevel.INFO) {
  return levelMap[level];
}

/** Slardar custom event level, default is info, enumerable debug | info | warning | error */
const slardarLevelMap = {
  [LogLevel.INFO]: 'info',
  [LogLevel.SUCCESS]: 'info',
  [LogLevel.WARNING]: 'warn',
  [LogLevel.ERROR]: 'error',
  [LogLevel.FATAL]: 'error',
};
export function getSlardarLevel(level = LogLevel.INFO) {
  return slardarLevelMap[level];
}
