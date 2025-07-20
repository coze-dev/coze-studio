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
 
/**
 * 这个模块是为了做校验设计的一个临时方案
 * 由于校验和值完全分离，所以存在状态同步的问题
 * 但由于时间有限，所以先这样简单搞了
 * 后面希望有一天能有时间对校验和值做统一建模，或者完全对接 rehaje 搞定
 */

import { isNil, isEmpty } from 'lodash-es';
import { type ValidatorProps } from '@flowgram-adapter/free-layout-editor';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type PlaygroundContext } from '@coze-workflow/nodes';
import { I18n } from '@coze-arch/i18n';

import {
  type ConditionBranchValue,
  type ConditionItem,
  type ElementOfRecord,
} from '../types';
import { calcComparisonDisabled } from '../condition-params-item/utils';
// eslint-disable-next-line @coze-arch/no-deep-relative-import
import { valueExpressionValidator } from '../../../../validators';

enum ValidateStatus {
  /**
   * 没有触发过校验，初始状态
   */
  DEFAULT = 'default',
  SUCCESS = 'success',
  ERROR = 'error',
}
export interface ValidateResult {
  isValid: boolean | null;
  validStatus: ValidateStatus;
  message: string | null;
}

export const defaultValidateResult: ValidateResult = {
  isValid: null,
  validStatus: ValidateStatus.DEFAULT,
  message: null,
};

const validateSuccessResult: ValidateResult = {
  isValid: true,
  validStatus: ValidateStatus.SUCCESS,
  message: null,
};

interface Validator<T> {
  (value: T, disabled?: boolean): ValidateResult;
}

const createRulesWithContext = (
  node: FlowNodeEntity,
  playgroundContext: PlaygroundContext,
) => {
  const rules: {
    left: Validator<ConditionItem['left']>;
    operator: Validator<ConditionItem['operator']>;
    right: Validator<ConditionItem['right']>;
  } = {
    left: (value: ConditionItem['left'], disabled = false) => {
      if (disabled) {
        return validateSuccessResult;
      }

      const requiredValidateResult = valueExpressionValidator({
        value,
        node,
        playgroundContext,
        required: true,
      });

      if (!requiredValidateResult) {
        return validateSuccessResult;
      } else {
        return {
          isValid: false,
          validStatus: ValidateStatus.ERROR,
          message: requiredValidateResult,
        };
      }

      // if (isNil(value) || isNil(value.content) || isEmpty(value.content)) {
      //   return {
      //     isValid: false,
      //     validStatus: ValidateStatus.ERROR,
      //     message: I18n.t('workflow_detail_condition_error_refer_empty'),
      //   };
      // } else {
      //   return validateSuccessResult;
      // }
    },
    operator: (value: ConditionItem['operator'], disabled = false) => {
      if (disabled) {
        return validateSuccessResult;
      }

      if (isNil(value)) {
        return {
          isValid: false,
          validStatus: ValidateStatus.ERROR,
          message: I18n.t('workflow_detail_condition_condition_empty'),
        };
      } else {
        return validateSuccessResult;
      }
    },
    right: (value: ConditionItem['right'], disabled = false) => {
      if (disabled) {
        return validateSuccessResult;
      }
      const emptyError = {
        isValid: false,
        validStatus: ValidateStatus.ERROR,
        message: I18n.t('workflow_detail_condition_error_enter_comparison'),
      };

      const requiredValidateResult = valueExpressionValidator({
        value,
        node,
        playgroundContext,
        required: true,
      });

      if (!requiredValidateResult) {
        return validateSuccessResult;
      } else {
        return {
          ...emptyError,
          message: requiredValidateResult,
        };
      }
    },
  };
  return rules;
};

export interface ConditionValidateResult {
  left: ValidateResult;
  operator: ValidateResult;
  right: ValidateResult;
}

export type BranchesValidateResult = Array<ConditionValidateResult[]>;

export const validateValue = (
  value: ElementOfRecord<ConditionItem>,
  rule:
    | Validator<ConditionItem['left']>
    | Validator<ConditionItem['operator']>
    | Validator<ConditionItem['right']>,
  disabled?: boolean,
) =>
  // const rule = rules[key];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rule(value as any, disabled);

export const validateAllBranches = (
  branches: ConditionBranchValue[],
  node: FlowNodeEntity,
  playgroundContext: PlaygroundContext,
) => {
  if (!branches) {
    return [];
  }
  const rules = createRulesWithContext(node, playgroundContext);

  const branchesValidateResult: BranchesValidateResult = [];

  branches.forEach((branch, branchIndex) => {
    branch.condition?.conditions?.forEach((condition, conditionIndex) => {
      const { left, right, operator } = condition;
      if (!branchesValidateResult[branchIndex]) {
        branchesValidateResult[branchIndex] = [];
      }

      branchesValidateResult[branchIndex][conditionIndex] = {
        left: validateValue(left, rules.left),
        operator: validateValue(operator, rules.operator),
        right: validateValue(
          right,
          rules.right,
          calcComparisonDisabled(operator),
        ),
      };
    });
  });

  return branchesValidateResult;
};

/**
 *
 * @param conditions
 * @param context
 * @returns
 * 外部触发的整体校验，需要告诉外部源数据是否校验通过
 */
export const validateAllBranchesFromOutside = (
  branches: ConditionBranchValue[],
  context: ValidatorProps['context'],
) => {
  const branchesValidateResults = validateAllBranches(
    branches,
    context.node,
    context.playgroundContext,
  );

  if (isEmpty(branchesValidateResults)) {
    return true;
  }

  const errors = branchesValidateResults
    .map(branchValidateResult =>
      branchValidateResult.map(item =>
        Object.entries(item).map(
          ([_key, result]) =>
            !result.isValid && (result.message || 'invalid condition'),
        ),
      ),
    )
    .flat(2)
    .filter(Boolean);

  return errors.length === 0 ? true : errors.join(';');
};
