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
 * This module is a temporary solution for doing verification design
 * Due to the complete separation of the checksum values, there is a problem with state synchronization
 * But due to time constraints, it's simple to do this first
 * I hope one day I can have time to model the checksum values uniformly, or completely connect with rehaje.
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
   * No verification has been triggered, initial state
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
 * External triggered overall verification, you need to tell the external source whether the data has passed the verification.
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
