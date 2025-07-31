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
import { type WithCustomStyle } from '@coze-workflow/base/types';
import { type FeedbackStatus } from '@flowgram-adapter/free-layout-editor';

import s from './index.module.less';

export interface FormItemErrorProps extends WithCustomStyle {
  feedbackText?: string;
  feedbackStatus?: FeedbackStatus;
}

export const FormItemFeedback = ({
  feedbackText,
  className,
  style,
}: FormItemErrorProps) =>
  feedbackText ? (
    <div className={classnames(s.formItemError, className)} style={style}>
      {feedbackText}
    </div>
  ) : null;
