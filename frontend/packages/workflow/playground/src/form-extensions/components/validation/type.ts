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

export interface ValidationError {
  message: string;
  path: string | string[];
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OnTestRunValidate = (callback: () => void) => any;

export interface ValidationContextProps {
  errors: ValidationError[];
  onTestRunValidate: OnTestRunValidate;
}

export interface ValidationProviderProps {
  errors: ValidationError[];
  children: React.ReactNode;
  onTestRunValidate: OnTestRunValidate;
}
