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

import { type FEATURE_FLAGS } from '../types';

export const readFgPromiseFromContext = async (): Promise<
  FEATURE_FLAGS | undefined
> => {
  const { __fetch_fg_promise__: globalFetchFgPromise } = window;
  if (globalFetchFgPromise) {
    const res = await globalFetchFgPromise;
    return res.data as FEATURE_FLAGS;
  }
  return undefined;
};

export const readFgValuesFromContext = () => {
  const { __fg_values__: globalFgValues } = window;
  if (globalFgValues && Object.keys(globalFgValues).length > 0) {
    return globalFgValues as FEATURE_FLAGS;
  }
  return undefined;
};
