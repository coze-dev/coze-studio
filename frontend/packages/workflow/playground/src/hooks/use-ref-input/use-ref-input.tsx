import { type CSSProperties } from 'react';

import { type FeedbackStatus } from '@flowgram-adapter/free-layout-editor';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  type ValueExpression,
  type ViewVariableType,
} from '@coze-workflow/base/types';
import { type TreeSelectProps } from '@coze/coze-design';

import {
  type CustomFilterVar,
  type RenderDisplayVarName,
} from '@/form-extensions/components/tree-variable-selector/types';

import { useRefInputProps } from './use-ref-input-props';
import { useRefInputNode } from './use-ref-input-node';

export const useRefInput = ({
  node,
  feedbackStatus,
  value,
  onChange,
  onBlur,
  disabled,
  readonly,
  testId,
  disabledTypes,
  showClear = false,
  customFilterVar,
  setFocused,
  style,
  invalidContent,
  renderDisplayVarName,
}: {
  node: FlowNodeEntity;
  feedbackStatus?: FeedbackStatus;
  value?: ValueExpression;
  onChange: (v: ValueExpression | undefined) => void;
  onBlur?: () => void;
  disabled?: boolean;
  readonly?: boolean;
  invalidContent?: string;
  renderDisplayVarName?: RenderDisplayVarName;
  testId?: string;
  disabledTypes?: ViewVariableType[];
  showClear?: boolean;
  customFilterVar?: CustomFilterVar;
  style?: CSSProperties;
  setFocused?: (focused: boolean) => void;
}) => {
  const { variablesDataSource, validateStatus } = useRefInputProps({
    disabledTypes,
    value,
    onChange,
    node,
    feedbackStatus,
  });

  const { renderVariableSelect, renderVariableDisplay } = useRefInputNode({
    value,
    onChange,
    onBlur,
    disabled,
    variablesDataSource,
    validateStatus: validateStatus as TreeSelectProps['validateStatus'],
    readonly,
    testId,
    disabledTypes,
    invalidContent,
    renderDisplayVarName,
    showClear,
    customFilterVar,
    setFocused,
    style,
  });
  return {
    renderVariableSelect,
    renderVariableDisplay,
  };
};
