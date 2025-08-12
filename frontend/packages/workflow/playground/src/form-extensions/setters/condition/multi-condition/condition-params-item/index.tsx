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

/* eslint-disable @coze-arch/no-deep-relative-import */
import React, { useMemo } from 'react';

import classNames from 'classnames';
import { useService } from '@flowgram-adapter/free-layout-editor';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import { useVariableTypeChange } from '@coze-workflow/variable';
import {
  WorkflowVariableService,
  type RefExpression,
  type ValueExpression,
  ValueExpressionType,
} from '@coze-workflow/variable';
import { useNodeTestId } from '@coze-workflow/base';

import { type ValueExpressionInputProps } from '@/form-extensions/components/value-expression-input';

import { withValidationField } from '../validate/ValidationField';
import { type ConditionValidateResult } from '../validate/validate';
import { type ConditionItem, type ElementOfRecord } from '../types';
import { useConditionContext } from '../context';
import { VariableSelector } from '../../../../components/tree-variable-selector';
import { ValueExpressionWithState } from './value-expression-with-state';
import {
  calcComparisonDisabled,
  processConditionData,
  processLeftSourceTypeChange,
  processRightDefaultValue,
  getRightValueInputType,
} from './utils';
import Operator from './operator';
import Delete from './delete';
const VariableSelectorField =
  withValidationField<typeof VariableSelector>(VariableSelector);
const OperatorField = withValidationField<typeof Operator>(Operator);
const ValueExpressionInputField = withValidationField<
  typeof ValueExpressionWithState
>(ValueExpressionWithState);

export interface ConditionParamsItemProps {
  branchIndex: number;
  /**
   * Current condition data index
   */
  index: number;
  /**
   * Current condition data
   */
  data: ConditionItem;
  /**
   * read only
   */
  readonly?: boolean;
  /**
   * Callback after the current condition data has changed
   */
  onDataChange: (value: ConditionItem) => void;
  /**
   * Remove callback on current condition
   */
  onDelete?: () => void;
  /**
   * verification result
   */
  conditionValidateResult?: ConditionValidateResult;
  className?: string;
  style?: React.CSSProperties;
  deletable?: boolean;
}

// TODO conversion is received uniformly in one place.
const valueToRefExpression = (value: string[]): RefExpression => ({
  type: ValueExpressionType.REF,
  content: {
    keyPath: value,
  },
});

export default function ConditionParamsItem({
  index,
  branchIndex,
  data,
  onDataChange,
  onDelete,
  className,
  conditionValidateResult,
  style,
  readonly,
  deletable,
}: ConditionParamsItemProps) {
  const { concatTestId } = useNodeTestId();
  const { setterPath } = useConditionContext();
  const workflowVariableService = useService<WorkflowVariableService>(
    WorkflowVariableService,
  );

  const node = useCurrentEntity();

  const sourceType = workflowVariableService.getWorkflowVariableByKeyPath(
    data.left?.content?.keyPath,
    { node },
  )?.viewType;

  const handleConditionChange =
    <T extends ElementOfRecord<ConditionItem>>(
      key: 'left' | 'operator' | 'right',
    ) =>
    (value: T): void => {
      let newData = { ...data, [key]: value };

      newData = processLeftSourceTypeChange(
        data,
        newData,
        workflowVariableService,
        node,
      );

      newData = processRightDefaultValue(sourceType, newData);

      newData = processConditionData(
        data,
        newData,
        workflowVariableService,
        node,
      );

      onDataChange?.(newData);
    };

  // Monitor changes in linkage variables to re-trigger the effect
  useVariableTypeChange({
    keyPath: data.left?.content?.keyPath,
    onTypeChange: ({ variableMeta }) => {
      if (!variableMeta) {
        // Variables have been deleted
        onDataChange?.({});
        return;
      }

      onDataChange?.({
        left: data.left,
      });
    },
  });
  const rightInputTypes = getRightValueInputType({
    sourceType,
    operator: data.operator,
    rightValue: data.right,
    useCompatibleType: true,
  });
  const rightInputTypeProps = useMemo<
    Pick<ValueExpressionInputProps, 'inputType' | 'inputTypes'>
  >(() => ({ inputTypes: rightInputTypes }), [rightInputTypes]);

  return (
    <div
      className={classNames('flex items-center gap-1 mb-2', className)}
      style={style}
    >
      <div
        className="overflow-hidden"
        style={{
          flex: '0 0 44px',
        }}
      >
        <OperatorField
          sourceType={sourceType}
          value={data.operator}
          onChange={handleConditionChange<ConditionItem['operator']>(
            'operator',
          )}
          validateResult={conditionValidateResult?.operator}
          testId={concatTestId(
            setterPath,
            `${branchIndex}`,
            `${index}`,
            'operator',
          )}
        />
      </div>
      <div className="flex-1">
        <VariableSelectorField
          style={{ width: '100%', marginBottom: 4 }}
          readonly={readonly}
          value={data.left?.content?.keyPath}
          onChange={(value: string[]) =>
            handleConditionChange<RefExpression>('left')(
              valueToRefExpression(value),
            )
          }
          validateResult={conditionValidateResult?.left}
          testId={concatTestId(
            setterPath,
            `${branchIndex}`,
            `${index}`,
            'left',
          )}
        />
        <ValueExpressionInputField
          readonly={readonly}
          {...rightInputTypeProps}
          disabled={calcComparisonDisabled(data.operator)}
          value={JSON.parse(JSON.stringify(data))?.right}
          onChange={handleConditionChange<ValueExpression>('right')}
          validateResult={conditionValidateResult?.right}
          operator={data.operator}
          testId={concatTestId(
            setterPath,
            `${branchIndex}`,
            `${index}`,
            'right',
          )}
        />
      </div>
      {readonly ? (
        <></>
      ) : (
        <div
          style={{
            flex: '0 0 24px',
          }}
        >
          <Delete
            testId={concatTestId(
              setterPath,
              `${branchIndex}`,
              `${index}`,
              'item',
              'remove',
            )}
            remove={onDelete}
            hidden={!deletable}
          />
        </div>
      )}
    </div>
  );
}
