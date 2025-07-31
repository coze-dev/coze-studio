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

import { useCallback, useEffect, useMemo } from 'react';

import {
  type DatabaseCondition,
  ViewVariableType,
  useNodeTestId,
} from '@coze-workflow/base';

import { useDatabaseNodeService } from '@/hooks';
import { IconRemove, withField, useField, useForm } from '@/form';

import { useConditionLeftDataType } from './use-condition-left-data-type';
import { ConditionRightField } from './condition-right-field';
import { ConditionOperatorField } from './condition-operator-field';
import { ConditionLeftField } from './condition-left-field';

const leftTypeToListTypeMaps = {
  [ViewVariableType.String]: ViewVariableType.ArrayString,
  [ViewVariableType.Integer]: ViewVariableType.ArrayInteger,
  [ViewVariableType.Time]: ViewVariableType.ArrayTime,
  [ViewVariableType.Number]: ViewVariableType.ArrayNumber,
  [ViewVariableType.Boolean]: ViewVariableType.ArrayBoolean,
};

export const ConditionItemField = withField(
  ({
    disableRemove = false,
    onClickRemove,
  }: {
    disableRemove?: boolean;
    onClickRemove?: () => void;
  }) => {
    const { name, value } = useField<DatabaseCondition>();
    const dataType = useConditionLeftDataType();
    const operator = value?.operator;
    const { getNodeSetterId } = useNodeTestId();

    const clearUpRightValueAndOperatorValueOnLeftChange =
      useClearUpRightValueAndOperatorValueOnLeftChange();

    useCleanupRightValueOnOperatorChange();

    // In the case of belonging to or not belonging to the operator, the type of the rvalue is the array type of the lvalue
    const rightFieldDataType = useMemo(
      () =>
        ['IN', 'NOT_IN'].includes(operator || '')
          ? leftTypeToListTypeMaps?.[dataType as ViewVariableType] ??
            ViewVariableType.ArrayString
          : dataType,
      [operator, dataType],
    );

    return (
      <div className="flex items-center gap-[4px] min-w-0">
        <div className="flex flex-1 items-center gap-[4px] min-w-0">
          <div className="w-[42px]">
            <ConditionOperatorField
              dataType={dataType}
              name={`${name}.operator`}
            />
          </div>
          <div className="flex-1 flex flex-col gap-[4px] min-w-0">
            <ConditionLeftField
              name={`${name}.left`}
              onChange={() => clearUpRightValueAndOperatorValueOnLeftChange()}
            />
            <ConditionRightField
              operation={value?.operator}
              name={`${name}.right`}
              dataType={rightFieldDataType}
            />
          </div>
        </div>
        {!disableRemove && (
          <IconRemove
            onClick={onClickRemove}
            testId={`${getNodeSetterId(name)}.remove`}
          />
        )}
      </div>
    );
  },
);

function useCleanupRightValueOnOperatorChange() {
  const { name, value } = useField<DatabaseCondition>();
  const form = useForm();
  const databaseNodeService = useDatabaseNodeService();

  useEffect(() => {
    if (
      databaseNodeService.checkConditionOperatorNoNeedRight(value?.operator)
    ) {
      form.setFieldValue(`${name}.right`, undefined);
    }
  }, [value?.operator]);
}

function useClearUpRightValueAndOperatorValueOnLeftChange() {
  const form = useForm();
  const { value, name } = useField<DatabaseCondition>();

  return useCallback(() => {
    form.setFieldValue(`${name}.operator`, undefined);
    form.setFieldValue(`${name}.right`, undefined);
  }, [form, name, value]);
}
