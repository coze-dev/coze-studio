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
  // coze 暂无warnings
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
