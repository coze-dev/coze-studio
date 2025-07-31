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

import {
  type RefExpression,
  type ValueExpression,
} from '@coze-workflow/base/types';
import { type ConditionType } from '@coze-workflow/base/api';

import { Logic } from './constants';

export interface ConditionItem {
  /**
   * Expression left data
   *  */
  left?: RefExpression;
  /**
   * Expression Operators
   */
  operator?: ConditionType;
  /**
   * Expression right data
   */

  right?: ValueExpression;
}

export { Logic };

export interface ConditionBranchValue {
  condition: {
    // And or or operations, corresponding to the logic of the backend data
    logic: Logic;
    conditions: ConditionItem[];
  };
}

export interface ConditionBranchValueWithUid extends ConditionBranchValue {
  uid: number;
}

export type ConditionValue = Array<ConditionBranchValue>;
export type ConditionValueWithUid = Array<ConditionBranchValueWithUid>;

export type ElementOfRecord<T> = T[keyof T];
