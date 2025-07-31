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

import { useMemo, useState, useEffect } from 'react';

import { uniq } from 'lodash-es';
import classNames from 'classnames';
import { useCurrentEntity } from '@flowgram-adapter/free-layout-editor';
import { useVariableTypeChange } from '@coze-workflow/variable';
import {
  ValueExpression,
  ValueExpressionType,
  ViewVariableType,
  useNodeTestId,
} from '@coze-workflow/base';

import { useVariableService } from '@/hooks';
import { VariableTypeSelector } from '@/form-extensions/components/variable-type-selector';
import { type InputType } from '@/form-extensions/components/literal-value-input';

import {
  ValueExpressionInput,
  type ValueExpressionInputProps,
} from './value-expression-input';

import styles from './index.module.less';

export const TypedValueExpressionInput = ({
  className,
  inputType,
  inputTypes = [],
  onChange,
  style,
  forbidTypeCast,
  defaultInputType,
  ...props
}: ValueExpressionInputProps) => {
  const node = useCurrentEntity();
  const variableService = useVariableService();
  const { concatTestId } = useNodeTestId();

  const {
    value,
    readonly,
    disabled,
    disabledTypes: outerDisabledTypes,
    testId,
  } = props;
  const outerInputType: ViewVariableType[] = inputTypes.concat(inputType ?? []);
  // When the value is null, the type information will be cached in this field after switching the type. To avoid when there is no value, call onChange to trigger the form null value verification, showing an error of "Parameter cannot be null"
  const [emptyValueInputType, setEmptyValueInputType] = useState<InputType>();
  const getDefaultInputType = (): InputType => {
    if (emptyValueInputType) {
      return emptyValueInputType;
    }

    let targetType: InputType | undefined = undefined;
    // The type is stored in rawMeta, and the type specified in rawMeta is returned.
    if (value?.rawMeta?.type) {
      targetType = value.rawMeta.type;
    }
    // Preferentially use the type determined above, otherwise: if it is a reference, return the type of the reference type variable
    if (!targetType && value && ValueExpression.isRef(value)) {
      const _refVariableType = variableService.getViewVariableByKeyPath(
        value.content?.keyPath,
        { node, checkScope: true },
      )?.type;
      if (_refVariableType && !outerDisabledTypes?.includes(_refVariableType)) {
        targetType = _refVariableType;
      }
    }

    // The default type is externally specified
    if (!targetType && defaultInputType) {
      targetType = defaultInputType;
    }

    // Take the first one from the complement of the disabled type as the default type
    if (!targetType) {
      const availableTypes = ViewVariableType.getComplement(
        outerDisabledTypes ?? [],
      );
      targetType =
        availableTypes?.[0] || outerInputType?.[0] || ViewVariableType.String;
    }
    // Determines whether the type of the type identified above is within the range specified by outerInputType
    if (outerInputType?.length) {
      return outerInputType.includes(targetType)
        ? targetType
        : outerInputType[0];
    }
    return targetType;
  };

  const innerInputType = useMemo(
    () => getDefaultInputType(),
    [value, outerInputType, outerDisabledTypes, emptyValueInputType],
  );

  const hiddenTypes = useMemo<ViewVariableType[] | undefined>(() => {
    // outerInputType hides other types when it has a value
    if (outerInputType?.length) {
      return ViewVariableType.getComplement(outerInputType);
    }
    return outerDisabledTypes;
  }, [outerInputType, outerDisabledTypes]);

  const handleTypeChange = (
    val?: string | number | Array<unknown> | Record<string, unknown>,
  ) => {
    if (!val) {
      return;
    }
    const type = val as InputType;
    const initialContent = ViewVariableType.isJSONInputType(type)
      ? ViewVariableType.isArrayType(type)
        ? '[]'
        : '{}'
      : undefined;
    // Value is a newly added parameter when it does not exist or only has a type field
    if (!value || ('type' in value && Object.keys(value)?.length === 1)) {
      if (initialContent) {
        setEmptyValueInputType(undefined);
        onChange({
          type: ValueExpressionType.LITERAL,
          content: initialContent,
          rawMeta: { type },
        });
      } else {
        setEmptyValueInputType(type);
      }
    } else {
      setEmptyValueInputType(undefined);
      if (ValueExpression.isRef(value)) {
        onChange({
          ...value,
          rawMeta: {
            ...value?.rawMeta,
            type,
          },
        });
      }
      // When switching types, clear content, different content types are not compatible
      if (ValueExpression.isLiteral(value)) {
        onChange({
          type: ValueExpressionType.LITERAL,
          content: initialContent,
          rawMeta: {
            ...value.rawMeta,
            type,
          },
        });
      }
    }
  };

  const [refVariableType, setRefVariableType] = useState<ViewVariableType>();
  useEffect(() => {
    if (!value || ValueExpression.isEmpty(value)) {
      setRefVariableType(undefined);
      return;
    }
    if (ValueExpression.isRef(value)) {
      const _refVariableType = variableService.getViewVariableByKeyPath(
        value.content?.keyPath,
        { node, checkScope: true },
      )?.type;
      setRefVariableType(_refVariableType);
    }
  }, [value]);
  const handleChange: ValueExpressionInputProps['onChange'] = val => {
    setEmptyValueInputType(undefined);
    // When emptied, the innerInputType is reset.
    if (!val || ValueExpression.isEmpty(val)) {
      // When val is undefined (remove the ref reference), empty it all and reset the innerInputType
      // Only empty content, do not reset innerInputType
      onChange(
        val
          ? {
              ...val,
              rawMeta: {
                ...val?.rawMeta,
                type: innerInputType,
              },
            }
          : val,
      );
      return;
    }
    // Update innerInputType when switching reference types
    let _inputType = innerInputType;
    if (ValueExpression.isRef(val)) {
      const _refVariableType = variableService.getViewVariableByKeyPath(
        val.content?.keyPath,
        { node, checkScope: true },
      )?.type;
      if (_refVariableType) {
        // When no external type is specified or the reference type is within the scope of the specified type, the reference variable can only update the variable type.
        if (
          !outerInputType?.length ||
          outerInputType.includes(_refVariableType)
        ) {
          _inputType = _refVariableType;
        }
      }
    }
    onChange({
      ...val,
      rawMeta: {
        ...val.rawMeta,
        type: _inputType,
      },
    });
    // Trigger onBlur validation
    props?.onBlur?.();
  };

  const keyPath =
    value && ValueExpression.isRef(value) ? value?.content?.keyPath ?? [] : [];
  // Externally modified variable type
  useVariableTypeChange({
    keyPath,
    onTypeChange: ({ variableMeta }) => {
      setRefVariableType(variableMeta?.type);
      if (variableMeta?.type && variableMeta.type !== innerInputType) {
        handleTypeChange(variableMeta.type);
      }
    },
  });

  // Automatically disable the drop-down box when there is only one type available (hiddenTypes+disabledTypes complement)
  const disableDropdown = useMemo(() => {
    const availableTypes = ViewVariableType.getComplement(
      uniq([...(outerDisabledTypes ?? []), ...(hiddenTypes ?? [])]),
    );

    return (
      (value &&
        (ValueExpression.isRef(value) || props.literalDisabled) &&
        forbidTypeCast) ||
      availableTypes.length <= 1
    );
  }, [
    outerDisabledTypes,
    hiddenTypes,
    forbidTypeCast,
    value,
    props.literalDisabled,
  ]);

  // Show warning messages on variable labels
  const showRefWarning =
    // When disabling type selection
    disableDropdown ||
    // The reference variable type exists but is not within the scope of the specified type
    (refVariableType &&
      outerInputType.length &&
      !outerInputType.includes(refVariableType));
  return (
    <div
      className={classNames(
        'typed-value-expression-input flex items-start w-full',
        className,
      )}
      style={style}
    >
      <div className={styles['variable-type-selector-wrapper']}>
        <VariableTypeSelector
          readonly={readonly}
          disabled={disabled}
          value={innerInputType}
          contentClassName="h-full"
          onChange={handleTypeChange}
          disabledTypes={outerDisabledTypes}
          testId={concatTestId(testId ?? '', 'variable-type-selector')}
          hiddenTypes={hiddenTypes}
          disableDropdown={disableDropdown}
          refVariableType={showRefWarning ? undefined : refVariableType}
        />
      </div>
      <ValueExpressionInput
        {...props}
        onChange={handleChange}
        inputType={innerInputType}
        variableTypeConstraints={
          showRefWarning
            ? {
                mainType: innerInputType,
                subType: ViewVariableType.isFileType(innerInputType)
                  ? props.availableFileTypes
                  : undefined,
              }
            : undefined
        }
      />
    </div>
  );
};
