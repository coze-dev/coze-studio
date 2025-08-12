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

export enum ReportEventNames {
  /**
   * generic exception error
   */
  ChunkLoadError = 'chunk_load_error', // Webpack chunk load failed
  Unhandledrejection = 'unhandledrejection', // Asynchronous Error Bottom Line
  GlobalErrorBoundary = 'global_error_boundary', // Global errorBoundary error
  NotInstanceError = 'notInstanceError',
  CustomErrorReport = 'custom_error_report', // Uniformly reported customs errors
}

/**
 *  Get the error that has been identified
 *
 * 1. CustomError: The business party throws new CustomError (ReportEventNames.xxx, 'xxx')
 * 2. AxiosError: The status code is not 2xx;
 * 3, ApiError: status code 2xx & business code! == 0
 * 4. ChunkLoadError: webpack chunk load failed
 * 5. notInstanceError, error that does not inherit Error, the current case (semi form verification)
 */
export type CertainErrorName =
  | 'CustomError'
  | 'AxiosError'
  | 'ApiError'
  | 'ChunkLoadError'
  | 'notInstanceError';
