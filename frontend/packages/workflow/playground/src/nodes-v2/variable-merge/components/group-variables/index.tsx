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

import React, { type FC, useState, type Ref, useRef } from 'react';

import {
  type FieldArrayRenderProps,
  type FieldState,
} from '@flowgram-adapter/free-layout-editor';
import { ValueExpression } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { SortableList } from '@/components/sortable-list';

import { TooltipWithDisabled } from '../tooltip-with-disabled';
import { MAX_GROUP_VARIABLE_COUNT } from '../../constants';
import { ValueExpressionInput } from '../../../components/value-expression-input';
import { FormItemFeedback } from '../../../components/form-item-feedback';
import { useVariablesFilter } from './use-variables-filter';
import { GroupVariablesItem } from './group-variables-item';

interface Props {
  variablesField: FieldArrayRenderProps<ValueExpression>['field'];
  groupIndex: number;
  readonly?: boolean;
  errors?: FieldState['errors'];
}

/**
 * grouping variables
 * @param param0
 * @returns
 */
export const GroupVariables: FC<Props> = ({
  groupIndex,
  variablesField,
  readonly,
  errors,
}) => {
  const { disabledTypes, customFilterVar } = useVariablesFilter(
    variablesField.value || [],
  );
  const variablesError = (errors || [])?.filter(
    error => error.name === variablesField.name,
  );
  const variablesLength = (variablesField?.value || []).length;
  const isEmpty = !variablesLength;
  const [variableFieldCandidate, setVariableFieldCandidate] =
    useState<ValueExpression>();
  const variableFieldCandidateRef = useRef<ValueExpression>();

  const updateVariableFieldCandidate = (val: ValueExpression | undefined) => {
    setVariableFieldCandidate(val);
    variableFieldCandidateRef.current = val;
  };

  const [refreshKey, refresh] = useState(1);
  return (
    <>
      <SortableList
        className="space-y-1 mt-1"
        value={variablesField.map(variableField => variableField)}
        onChange={sortedFields => {
          variablesField.onChange(
            sortedFields.map(variableField => variableField.value),
          );
        }}
        renderItem={(variableField, variablesIndex, dragOption) => (
          <GroupVariablesItem
            variablesField={variablesField}
            groupIndex={groupIndex}
            index={variablesIndex}
            variableField={variableField}
            dragRef={dragOption?.dragRef as Ref<HTMLElement>}
            readonly={readonly}
            disabledTypes={disabledTypes}
            customFilterVar={customFilterVar}
            disableDrag={variablesLength === 1}
          ></GroupVariablesItem>
        )}
      ></SortableList>
      {readonly ? null : (
        <TooltipWithDisabled
          disabled={variablesLength < MAX_GROUP_VARIABLE_COUNT}
          content={I18n.t('workflow_var_merge_var_number_max')}
        >
          <div className="flex w-full mt-1">
            {!isEmpty ? <div className="w-6 mr-1 shrink-0"></div> : null}

            <ValueExpressionInput
              key={refreshKey}
              value={variableFieldCandidate}
              style={{ flex: 1 }}
              name={''}
              onChange={v => {
                const val = v as ValueExpression;

                // If it is a literal or null value, it is cached to variableFieldCandidate
                if (
                  ValueExpression.isLiteral(val) ||
                  ValueExpression.isEmpty(val)
                ) {
                  updateVariableFieldCandidate(val);
                } else {
                  // Non-empty ref variable, append to variablesField
                  updateVariableFieldCandidate(undefined);
                  variablesField.append(val);
                }
              }}
              onBlur={() => {
                // Literal variable, when out of focus, append to variablesField if variableFieldCandidate have a value
                if (
                  variableFieldCandidateRef.current &&
                  ValueExpression.isLiteral(variableFieldCandidateRef.current)
                ) {
                  variablesField.append(variableFieldCandidateRef.current);
                  updateVariableFieldCandidate(undefined);
                  refresh(prev => prev + 1);
                }
              }}
              placeholder={I18n.t('workflow_var_merge_var_placeholder')}
              literalDisabled={false}
              disabledTypes={disabledTypes}
              customFilterVar={customFilterVar}
              readonly={variablesLength >= MAX_GROUP_VARIABLE_COUNT}
              isError={variablesError.length > 0}
            />

            {!isEmpty ? <div className="w-6 shrink-0 ml-1"></div> : null}
          </div>
        </TooltipWithDisabled>
      )}
      <FormItemFeedback errors={variablesError} />
    </>
  );
};
