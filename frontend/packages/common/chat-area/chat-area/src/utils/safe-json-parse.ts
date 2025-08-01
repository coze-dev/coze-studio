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

export const safeJSONParse = (value?: string): unknown => {
  if (!value) {
    return void 0;
  }
  try {
    return JSON.parse(value);
  } catch {
    return void 0;
  }
};

export const safeJSONParseV2 = <T = unknown>(
  value: string,
  fallback: T | null,
):
  | {
      parseSuccess: true;
      useFallback: false;
      value: T;
    }
  | {
      parseSuccess: false;
      useFallback: true;
      value: T;
    }
  | {
      parseSuccess: false;
      useFallback: false;
      value: null;
    } => {
  try {
    return {
      parseSuccess: true,
      value: JSON.parse(value),
      useFallback: false,
    };
  } catch (error) {
    if (fallback !== null) {
      return {
        parseSuccess: false,
        useFallback: true,
        value: fallback,
      };
    }
    return {
      parseSuccess: false,
      useFallback: false,
      value: null,
    };
  }
};
