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

import { type CSSProperties } from 'react';

import { type FeedbackStatus } from '@flowgram-adapter/free-layout-editor';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import {
  type ValueExpression,
  type ViewVariableType,
} from '@coze-workflow/base/types';
import { type TreeSelectProps } from '@coze-arch/coze-design';

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
