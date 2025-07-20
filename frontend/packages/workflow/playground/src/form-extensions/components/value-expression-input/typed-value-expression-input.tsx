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
  // value 为空时，切换类型后类型信息会缓存到这个字段里。避免没有值的时候，调用 onChange 触发表单空值校验，显示「参数不可为空」报错
  const [emptyValueInputType, setEmptyValueInputType] = useState<InputType>();
  const getDefaultInputType = (): InputType => {
    if (emptyValueInputType) {
      return emptyValueInputType;
    }

    let targetType: InputType | undefined = undefined;
    // rawMeta 里存了类型，返回 rawMeta 里指定的类型
    if (value?.rawMeta?.type) {
      targetType = value.rawMeta.type;
    }
    // 优先用上面确定的类型,否则:如果是引用，返回引用类型变量的类型
    if (!targetType && value && ValueExpression.isRef(value)) {
      const _refVariableType = variableService.getViewVariableByKeyPath(
        value.content?.keyPath,
        { node, checkScope: true },
      )?.type;
      if (_refVariableType && !outerDisabledTypes?.includes(_refVariableType)) {
        targetType = _refVariableType;
      }
    }

    // 外部指定了默认类型
    if (!targetType && defaultInputType) {
      targetType = defaultInputType;
    }

    // 从禁用类型的补集里取第一个作为默认类型
    if (!targetType) {
      const availableTypes = ViewVariableType.getComplement(
        outerDisabledTypes ?? [],
      );
      targetType =
        availableTypes?.[0] || outerInputType?.[0] || ViewVariableType.String;
    }
    // 判断上面确定的类型 targetType 是否在 outerInputType 指定的范围内
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
    // outerInputType 有值时，隐藏其他类型
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
    // value 不存在或者只有 type 字段时，是新添加的参数
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
      // 字面量切换类型时，清空 content，不同 content 类型不兼容
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
    // 清空时，会重置 innerInputType
    if (!val || ValueExpression.isEmpty(val)) {
      // val 为 undefined 时(删除 ref 引用)，全部清空，innerInputType 也会重置
      // 只清空 content，不重置 innerInputType
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
    // 切换引用类型时，更新 innerInputType
    let _inputType = innerInputType;
    if (ValueExpression.isRef(val)) {
      const _refVariableType = variableService.getViewVariableByKeyPath(
        val.content?.keyPath,
        { node, checkScope: true },
      )?.type;
      if (_refVariableType) {
        // 外部没有指定类型时或者引用类型在指定类型的范围内，引用变量才能更新变量类型，
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
    // 触发 onBlur 校验
    props?.onBlur?.();
  };

  const keyPath =
    value && ValueExpression.isRef(value)
      ? (value?.content?.keyPath ?? [])
      : [];
  // 外部修改了变量类型
  useVariableTypeChange({
    keyPath,
    onTypeChange: ({ variableMeta }) => {
      setRefVariableType(variableMeta?.type);
      if (variableMeta?.type && variableMeta.type !== innerInputType) {
        handleTypeChange(variableMeta.type);
      }
    },
  });

  // 当可用类型（hiddenTypes+disabledTypes 的补集）只有一种时，自动禁用下拉框
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

  // 显示变量标签上的警告信息
  const showRefWarning =
    // 禁用类型选择时
    disableDropdown ||
    // 引用变量类型存在但不在指定类型范围内
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
