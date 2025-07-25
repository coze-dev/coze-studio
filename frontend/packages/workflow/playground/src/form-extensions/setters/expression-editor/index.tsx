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
    /** 最大长度 */
    maxLength?: number;
    /** 最小行数 */
    minRows?: number;
    /** 占位文本 */
    placeholder?: string | (() => string);
    /** 是否禁用变量引用模式，输入 {{ 弹出变量浮层，默认启用，可以配置关闭 */
    disableSuggestion?: boolean;
    /** 是否禁用长度计数器，默认禁用，可配置开启 */
    disableCounter?: boolean;
    /** 失焦回调 */
    onBlur?: () => void;
    /** 聚焦回调 */
    onFocus?: () => void;
    /** 是否展示错误状态 */
    isError?: boolean;
    /** 输入变量（仅用于触发rehaje重新渲染表单 */
    inputParameters?: unknown[];
    /** 自定义 className */
    customClassName?: string;
  }
>;

// TODO 临时hack方法，兜底线上问题，排查出来具体原因后删除
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

  // TODO 临时Hack 兜底线上问题
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
