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
   * 表达式 left 数据
   *  */
  left?: RefExpression;
  /**
   * 表达式运算符
   */
  operator?: ConditionType;
  /**
   * 表达式 right 数据
   */

  right?: ValueExpression;
}

export { Logic };

export interface ConditionBranchValue {
  condition: {
    // And 或 Or 操作，对应后端数据的 logic
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
