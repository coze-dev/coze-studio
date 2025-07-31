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

import React, { type FC, type Ref } from 'react';

import classnames from 'classnames';
import {
  type FieldArrayRenderProps,
  type FieldRenderProps,
  Field,
} from '@flowgram-adapter/free-layout-editor';
import { IconHandle } from '@douyinfe/semi-icons';
import {
  type ViewVariableType,
  type ValueExpression,
} from '@coze-workflow/variable';
import { IconCozMinus } from '@coze-arch/coze-design/icons';
import { IconButton } from '@coze-arch/coze-design';

import { RefTagColor } from '@/form-extensions/components/value-expression-input/ref-value-display';
import { type CustomFilterVar } from '@/form-extensions/components/tree-variable-selector/types';

import { ValueExpressionInput } from '../../../components/value-expression-input';
import { FormItemFeedback } from '../../../components/form-item-feedback';
import { useIsOutputVariable } from './use-is-output-variable';

interface Props {
  variablesField: FieldArrayRenderProps<ValueExpression>['field'];
  index: number;
  groupIndex: number;
  variableField: FieldRenderProps<ValueExpression>['field'];
  dragRef: Ref<HTMLElement>;
  readonly?: boolean;
  disabledTypes?: ViewVariableType[];
  customFilterVar?: CustomFilterVar;
  disableDrag?: boolean;
}

/**
 * Group Variable Item
 * @param param0
 * @returns
 */
export const GroupVariablesItem: FC<Props> = ({
  variablesField,
  readonly,
  groupIndex,
  index,
  variableField,
  dragRef,
  disabledTypes,
  customFilterVar,
  disableDrag,
}) => {
  const isOutput = useIsOutputVariable(groupIndex, index);
  return (
    <Field name={variableField.name}>
      {({ field, fieldState }: FieldRenderProps<ValueExpression>) => (
        <>
          <div key={index} className="flex w-full items-center">
            <span
              className={classnames(
                'flex items-center',
                disableDrag ? 'cursor-not-allowed' : 'cursor-move',
              )}
            >
              <IconHandle
                ref={dragRef}
                className={classnames(
                  'px-1 mr-1 coz-fg-secondary',
                  disableDrag ? 'pointer-events-none' : '',
                )}
              />
            </span>

            <ValueExpressionInput
              {...field}
              readonly={readonly}
              disabledTypes={disabledTypes}
              customFilterVar={customFilterVar}
              onChange={v => {
                if (!v) {
                  variablesField.delete(index);
                  return;
                }
                field.onChange(v as ValueExpression);
              }}
              style={{ flex: 1 }}
              literalDisabled={false}
              isError={!!(fieldState?.errors && fieldState.errors.length)}
              refTagColor={isOutput ? RefTagColor.Green : RefTagColor.Primary}
              hideDeleteIcon
              forbidTypeCast
            />

            <IconButton
              className="relative top-[-1px] ml-1"
              disabled={readonly}
              color="secondary"
              size="small"
              icon={<IconCozMinus className="text-lg" />}
              onClick={() => variablesField.delete(index)}
            ></IconButton>
          </div>
          {fieldState?.errors && fieldState.errors.length ? (
            <div className="pl-7">
              <FormItemFeedback errors={fieldState?.errors} />
            </div>
          ) : null}
        </>
      )}
    </Field>
  );
};
