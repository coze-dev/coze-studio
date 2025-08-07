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

import * as base from './../base';
export { base };
export interface Price {
  /** amount */
  amount: string,
  /** Currencies such as USD and CNY */
  currency: string,
  /** decimal places */
  decimal_num: number,
}
export enum FollowType {
  /** Unknown */
  Unknown = 0,
  /** followee */
  Followee = 1,
  /** follower */
  Follower = 2,
  /** MutualFollow */
  MutualFollow = 3,
}