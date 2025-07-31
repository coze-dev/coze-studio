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

import React from 'react';

import classnames from 'classnames';
import {
  type FieldState,
  type FieldError,
  type FieldWarning,
} from '@flowgram-adapter/free-layout-editor';
import { type WithCustomStyle } from '@coze-workflow/base/types';

import s from './index.module.less';

export interface FormItemErrorProps extends WithCustomStyle {
  errors?: FieldState['errors'];
  // Coze has no warnings
  // warnings?: FieldState['warnings'];
}

export const FormItemFeedback = ({
  errors,
  className,
  style,
}: FormItemErrorProps) => {
  const renderFeedbacks = (fs: FieldError[] | FieldWarning[]) =>
    fs.map(f => <span key={f.field}>{f.message}</span>);
  return errors ? (
    <div className={classnames(s.formItemError, className)} style={style}>
      {renderFeedbacks(errors)}
    </div>
  ) : null;
};
