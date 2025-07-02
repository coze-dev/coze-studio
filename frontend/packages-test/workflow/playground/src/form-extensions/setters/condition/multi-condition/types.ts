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
