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

import { useEffect } from 'react';

import { get } from 'lodash-es';
import { useService } from '@flowgram-adapter/free-layout-editor';
import {
  useVariableTypeChange,
  WorkflowVariableService,
} from '@coze-workflow/variable';
import {
  type ViewVariableType,
  ValueExpressionType,
  useNodeTestId,
  type ValueExpression,
} from '@coze-workflow/base';

import { useReadonly } from '@/nodes-v2/hooks/use-readonly';
import { type ComponentProps } from '@/nodes-v2/components/types';
import { useNodeAvailableVariablesWithNode } from '@/form-extensions/hooks';
import { type InputType } from '@/form-extensions/components/value-expression-input/InputField';
import {
  ValueExpressionInput as ValueExpressionInputComponent,
  type ValueExpressionInputProps as ValueExpressionInputComponentProps,
} from '@/form-extensions/components/value-expression-input';
import {
  formatWithNodeVariables,
  formatVariableDataByMatchType,
} from '@/form-extensions/components/tree-variable-selector/utils';

interface ValueExpressionInputOptions
  extends Pick<
    ValueExpressionInputComponentProps,
    | 'style'
    | 'variableTagStyle'
    | 'disabledTypes'
    | 'availableFileTypes'
    | 'literalDisabled'
    | 'refDisabled'
    | 'hideDeleteIcon'
    | 'hideSettingIcon'
    | 'showClear'
    | 'readonly'
    | 'customFilterVar'
    | 'placeholder'
    | 'refTagColor'
    | 'selectStyle'
    | 'literalStyle'
    | 'forbidTypeCast'
    | 'defaultInputType'
    | 'inputType'
    | 'inputTypes'
    | 'inputPlaceholder'
    | 'literalConfig'
  > {
  isError?: boolean;
  matchType?: ViewVariableType;
}

export type ValueExpressionInputProps = ComponentProps<
  ValueExpression | undefined
> &
  ValueExpressionInputOptions;

export const ValueExpressionInput = (props: ValueExpressionInputProps) => {
  const {
    value,
    onChange,
    onBlur,
    style,
    selectStyle,
    literalStyle,
    disabledTypes,
    availableFileTypes = [],
    literalDisabled = false,
    refDisabled = false,
    showClear = false,
    hideDeleteIcon = false,
    hideSettingIcon = false,
    readonly: setterReadonly,
    inputType,
    inputTypes,
    customFilterVar,
    name,
    isError,
    placeholder,
    inputPlaceholder,
    refTagColor,
    matchType,
    forbidTypeCast,
    defaultInputType,
    literalConfig,
  } = props;

  const globalReadonly = useReadonly();

  const readonly = globalReadonly || setterReadonly;

  const availableVariables = useNodeAvailableVariablesWithNode();

  const { getNodeSetterId } = useNodeTestId();

  const variableService: WorkflowVariableService = useService(
    WorkflowVariableService,
  );
  const variablesDataSource = formatWithNodeVariables(
    availableVariables,
    disabledTypes || [],
  );

  const variablesMatchedDataSource = formatVariableDataByMatchType(
    variablesDataSource,
    matchType,
  );

  const keyPath = get(value, 'content.keyPath') as string[] | undefined;

  // Monitor changes in linkage variables to re-trigger the effect
  useEffect(() => {
    const hasDisabledTypes =
      Array.isArray(disabledTypes) && disabledTypes.length > 0;

    if (!keyPath || !hasDisabledTypes) {
      return;
    }

    const listener = variableService.onListenVariableTypeChange(
      keyPath,
      v => {
        // If the variable type changes and is located in disabledTypes, it needs to be cleared
        if (v && (disabledTypes || []).includes(v.type)) {
          onChange({
            type: ValueExpressionType.REF,
          });
        }
      },
      {},
    );

    return () => {
      listener?.dispose();
    };
  }, [keyPath, disabledTypes, variableService, onChange]);

  useVariableTypeChange({
    keyPath,
    onTypeChange: ({ variableMeta: v }) => {
      const hasDisabledTypes =
        Array.isArray(disabledTypes) && disabledTypes.length > 0;
      if (!hasDisabledTypes) {
        return;
      }

      if (v && (disabledTypes || []).includes(v.type)) {
        onChange({
          type: ValueExpressionType.REF,
        });
      }
    },
  });
  const targetInputType = inputType;

  return (
    <ValueExpressionInputComponent
      testId={getNodeSetterId(name)}
      readonly={readonly}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      inputType={targetInputType as InputType}
      inputTypes={inputTypes}
      variablesDatasource={variablesMatchedDataSource}
      validateStatus={isError ? 'error' : undefined}
      style={style}
      selectStyle={selectStyle}
      literalStyle={literalStyle}
      disabledTypes={disabledTypes as ViewVariableType[]}
      availableFileTypes={availableFileTypes}
      literalDisabled={literalDisabled}
      refDisabled={refDisabled}
      showClear={showClear}
      customFilterVar={customFilterVar}
      placeholder={placeholder}
      inputPlaceholder={inputPlaceholder}
      refTagColor={refTagColor}
      hideDeleteIcon={hideDeleteIcon}
      hideSettingIcon={hideSettingIcon}
      forbidTypeCast={forbidTypeCast}
      defaultInputType={defaultInputType}
      literalConfig={literalConfig}
    />
  );
};
