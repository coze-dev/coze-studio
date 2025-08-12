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

const quota = {
  /** The current consumption amount corresponds to the daily refresh in the package. */
  remain: 0,
  total: 0,
  used: 0,
  /** The additional purchase amount is currently only processed in China. */
  extraRemain: 0,
  extraTotal: 0,
  extraUsed: 0,
};
export function usePremiumQuota() {
  return quota;
}
