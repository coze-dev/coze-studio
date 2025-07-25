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
  /** 当前消耗的额度，对应到套餐内每天刷新的 */
  remain: 0,
  total: 0,
  used: 0,
  /** 额外购买的额度，目前只处理国内 */
  extraRemain: 0,
  extraTotal: 0,
  extraUsed: 0,
};
export function usePremiumQuota() {
  return quota;
}
