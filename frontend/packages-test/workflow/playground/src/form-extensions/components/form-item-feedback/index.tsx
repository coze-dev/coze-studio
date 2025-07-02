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
