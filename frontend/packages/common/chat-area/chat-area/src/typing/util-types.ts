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

export type NullableType<T> = {
  [P in keyof T]: T[P] | null;
};

export type NonNullableType<T> = {
  [P in keyof T]: Exclude<T[P], null>;
};

type AllOptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];
type AllNonOptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

/**
 * It is required that the parameters must be passed, and the undefined value can be reserved.
 * Prevent missing keys during passthrough
 * refer: https://stackoverflow.com/a/75389230/7526989
 */
export type NormalizeParameter<T> = {
  [K in AllOptionalKeys<T>]: T[K] | undefined;
} & {
  [K in AllNonOptionalKeys<T>]: T[K];
};
