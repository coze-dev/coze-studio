import React from 'react';

import {
  type SetterComponentProps,
  type SetterExtension,
} from '@flowgram-adapter/free-layout-editor';
import { type ViewVariableType, useNodeTestId } from '@coze-workflow/base';
import { type SelectProps } from '@coze/coze-design';

import { useRefInputProps } from '@/hooks/use-ref-input';

import { valueExpressionValidator } from '../../validators/value-expression-validator';
import { ValueExpressionInput as ValueExpressionInputComponent } from '../../components/value-expression-input';
type ValueExpressionInputProps = SetterComponentProps;

const ValueExpressionInput = (props: ValueExpressionInputProps) => {
  const {
    value,
    onChange,
    options,
    feedbackStatus,
    readonly: globalReadonly,
    context,
  } = props;

  const {
    style,
    literalStyle,
    disabledTypes,
    availableFileTypes,
    literalDisabled = false,
    refDisabled = false,
    showClear = false,
    hideDeleteIcon = false,
    hideSettingIcon = false,
    variableTagStyle,
    readonly: setterReadonly,
    inputType,
    constantType,
    customFilterVar,
    literalConfig = {},
    inputPlaceholder,
  } = options;

  const readonly = globalReadonly || setterReadonly;

  const { getNodeSetterId } = useNodeTestId();

  const targetInputType = inputType;

  const { variablesDataSource, validateStatus } = useRefInputProps({
    disabledTypes,
    value,
    onChange,
    node: context.node,
    feedbackStatus,
  });

  return (
    <ValueExpressionInputComponent
      testId={getNodeSetterId(context.path)}
      readonly={readonly}
      value={value}
      onChange={onChange}
      inputType={constantType ?? targetInputType}
      variablesDatasource={variablesDataSource}
      validateStatus={validateStatus as SelectProps['validateStatus']}
      style={style}
      disabledTypes={disabledTypes as ViewVariableType[]}
      availableFileTypes={availableFileTypes}
      literalDisabled={literalDisabled}
      refDisabled={refDisabled}
      showClear={showClear}
      customFilterVar={customFilterVar}
      literalConfig={literalConfig}
      literalStyle={literalStyle}
      hideDeleteIcon={hideDeleteIcon}
      hideSettingIcon={hideSettingIcon}
      variableTagStyle={variableTagStyle}
      inputPlaceholder={inputPlaceholder}
    />
  );
};

export const valueExpressionInput: SetterExtension = {
  key: 'ValueExpressionInput',
  component: ValueExpressionInput,
  validator: ({ value, context }) => {
    const { meta, playgroundContext, node } = context;
    const { required } = meta;
    return valueExpressionValidator({
      value,
      playgroundContext,
      node,
      required,
    });
  },
};
