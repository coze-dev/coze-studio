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

import classNames from 'classnames';
import { type ValueExpression, useNodeTestId } from '@coze-workflow/base';

import {
  ValueExpressionInput as ValueExpressionInputLegacy,
  type ValueExpressionInputProps as ValueExpressionInputLegacyProps,
} from '@/nodes-v2/components/value-expression-input';
import { useField, withField } from '@/form';

export type ValueExpressionInputProps = Pick<
  ValueExpressionInputLegacyProps,
  | 'style'
  | 'inputType'
  | 'disabledTypes'
  | 'availableFileTypes'
  | 'customFilterVar'
  | 'selectStyle'
  | 'literalConfig'
  | 'hideDeleteIcon'
  | 'literalDisabled'
> & {
  testId?: string;
  className?: string;
  inputPlaceholder?: string;
  literalDisabled?: boolean;
  customReadonly?: boolean;
};

function ValueExpressionInput({
  style,
  inputType,
  disabledTypes,
  availableFileTypes,
  testId,
  customFilterVar,
  selectStyle,
  className,
  inputPlaceholder,
  literalConfig,
  hideDeleteIcon,
  literalDisabled,
  customReadonly,
}: ValueExpressionInputProps) {
  const { name, value, onChange, errors, onBlur, readonly } =
    useField<ValueExpression>();
  const { getNodeSetterId } = useNodeTestId();

  return (
    <div
      className={classNames('flex flex-col items-start', className)}
      data-testid={getNodeSetterId(name)}
      style={{
        ...style,
        pointerEvents: readonly ? 'none' : 'auto',
      }}
    >
      <ValueExpressionInputLegacy
        value={value}
        onChange={v => onChange(v as ValueExpression)}
        name={testId ?? name}
        isError={errors && errors?.length > 0}
        onBlur={onBlur}
        inputType={inputType}
        disabledTypes={disabledTypes}
        availableFileTypes={availableFileTypes}
        customFilterVar={customFilterVar}
        selectStyle={selectStyle}
        inputPlaceholder={inputPlaceholder}
        literalDisabled={literalDisabled}
        literalConfig={literalConfig}
        hideDeleteIcon={hideDeleteIcon}
        readonly={customReadonly}
      />
    </div>
  );
}

export const ValueExpressionInputField =
  withField<ValueExpressionInputProps>(ValueExpressionInput);
