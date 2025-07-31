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

import { type FEATURE_FLAGS as ORIGIN_FEATURE_FLAGS } from './feature-flags';

// eslint-disable-next-line @typescript-eslint/naming-convention
type FEATURE_FLAGS = ORIGIN_FEATURE_FLAGS & {
  /**
   * Returns a list of all available keys
   */
  keys: string[];
  /**
   * Has FG completed initialization?
   */
  isInited: boolean;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __fetch_fg_promise__: Promise<{ data: FEATURE_FLAGS }>;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __fg_values__: FEATURE_FLAGS;
  }
}

export { type FEATURE_FLAGS };

export type FetchFeatureGatingFunction = () => Promise<FEATURE_FLAGS>;
