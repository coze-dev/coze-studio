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

/**
 * log level
 */
export const enum LogLevel {
  /**
   * log
   */
  INFO = 'info',
  /**
   * success log
   */
  SUCCESS = 'success',
  /**
   * Errors caused by interface problems
   * Edge cases that do not affect user use
   * non-core functional issues
   */
  WARNING = 'warning',
  /**
   * Serious mistake
   */
  ERROR = 'error',
  /**
   * fault
   */
  FATAL = 'fatal',
}
/**
 * Log actions that describe the behavior of consuming logs
 */
export const enum LogAction {
  /**
   * Output to browser console
   */
  CONSOLE = 'console',
  /**
   * Persistence, that is, reporting to the platform
   */
  PERSIST = 'persist',
}

/**
 * common log configuration
 */
export interface CommonLogOptions {
  /**
   * namespace
   */
  namespace?: string;
  /**
   * scope
   * Hierarchy: namespace > scope
   */
  scope?: string;
  /**
   * log level
   * @default LogLevel.INFO
   */
  level?: LogLevel;
  /**
   * Log actions that describe the behavior of consuming logs
   * @default [LogAction.CONSOLE]
   */
  action?: LogAction[];
  /**
   * log message
   * Required in the Output to Browser Console scenario.
   * Final output to browser console: ${namespace} ${scope} ${message}
   */
  message?: string;
  /**
   * event name
   * Required under the reported incident scenario.
   */
  eventName?: string;
  /**
   * Extended information that can be used to describe the context of logs/events
   */
  meta?: Record<string, unknown>;
  /**
   * Error
   * Required under error log/event scenario
   */
  error?: Error;
}

/**
 * Reporting to the Platform Client
 */
export interface LoggerReportClient {
  send: (options: CommonLogOptions) => void;
}

export type LogOptionsResolver = (
  options: CommonLogOptions,
) => CommonLogOptions;

export interface BaseLoggerOptions {
  ctx?: CommonLogOptions;
  clients?: LoggerReportClient[];
  beforeSend?: LogOptionsResolver[];
  disableConsole?: boolean;
}

// Make some properties required
type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Beautify output, develop and improve efficiency
 * type A = { a: string };
 * type B = { b: string };
 * type C = A & B;
 * type PrettyC = Pretty<A & B>;
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Pretty<T extends Record<string, any>> = {
  [key in keyof T]: T[key];
};

export type LogOptions = Pretty<WithRequired<CommonLogOptions, 'message'>>;

export const enum ErrorType {
  /**
   * API HTTPCode not 200
   */
  ApiError = 'ApiError',
  /**
   * API htpCode 200, there is an exception in the business Code
   */
  ApiBizError = 'ApiBizError',
  /**
   * Uncategorized error
   */
  Unknown = 'Unknown',
}

export interface ApiErrorOption {
  httpStatus: string;
  /**
   * Business code
   */
  code?: string;
  message?: string;
  logId?: string;
  requestConfig?: Record<string, unknown>;
  response?: Record<string, unknown>;
  /**
   * Error types, used to refine monitoring
   * @default ErrorType.ApiError
   */
  errorType?: string;
}
