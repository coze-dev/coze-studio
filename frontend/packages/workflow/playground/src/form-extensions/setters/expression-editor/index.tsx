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

import { isObject } from 'lodash-es';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';
import { reporter } from '@coze-workflow/base';

// import { expressionEditorValidator } from './validator';
import { ExpressionEditorContainer } from './container';

export type ExpressionEditorProps = SetterComponentProps<
  string,
  {
    key?: string;
    /** Maximum length */
    maxLength?: number;
    /** minimum number of rows */
    minRows?: number;
    /** placeholder text */
    placeholder?: string | (() => string);
    /** Whether to disable the variable reference mode, enter {{pop-up variable floating layer, enabled by default, and can be configured to close */
    disableSuggestion?: boolean;
    /** Whether to disable the length counter, disabled by default, configurable to turn on */
    disableCounter?: boolean;
    /** out of focus callback */
    onBlur?: () => void;
    /** focus callback */
    onFocus?: () => void;
    /** Whether to display the error status */
    isError?: boolean;
    /** Input variables (used only to trigger rehaje to rerender the form) */
    inputParameters?: unknown[];
    /** Custom className */
    customClassName?: string;
  }
>;

// TODO temporary hacking method, cover the online problem, and delete it after troubleshooting the specific reason.
const getAnyValueContent = (value: unknown): string => {
  if (
    isObject(value) &&
    'value' in value &&
    isObject(value.value) &&
    'content' in value.value
  ) {
    reporter.event({
      eventName: 'workflow_invalid_end_schema_format',
    });
    return value.value.content as string;
  }

  return value as string;
};

export const ExpressionEditor = ({
  value,
  onChange,
  options,
  readonly,
  context,
  feedbackStatus,
}: ExpressionEditorProps) => {
  const {
    key,
    placeholder,
    minRows,
    maxLength,
    disableSuggestion,
    disableCounter,
    customClassName,
  } = options;

  // TODO Temporary Hack Backup Online Issue
  const text = getAnyValueContent(value);

  return (
    <ExpressionEditorContainer
      context={context}
      key={key}
      value={text}
      readonly={readonly}
      onChange={onChange}
      placeholder={placeholder}
      minRows={minRows}
      maxLength={maxLength}
      disableSuggestion={disableSuggestion}
      disableCounter={disableCounter}
      customClassName={customClassName}
      isError={feedbackStatus === 'error'}
    />
  );
};

export const expressionEditor = {
  key: 'ExpressionEditor',
  component: ExpressionEditor,
  // validator: expressionEditorValidator,
};
