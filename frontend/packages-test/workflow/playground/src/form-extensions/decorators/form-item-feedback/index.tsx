import React from 'react';

import { type DecoratorComponentProps } from '@flowgram-adapter/free-layout-editor';

import { FormItemFeedback } from '../../components/form-item-feedback';

type FormItemFeedbackProps = DecoratorComponentProps;

export const FormItemFeedback2Decorator = ({
  children,
  feedbackText,
  feedbackStatus,
  options,
}: FormItemFeedbackProps) => {
  const { className, style } = options;

  return (
    <div className={className} style={style}>
      {children}
      <FormItemFeedback
        feedbackText={feedbackText}
        feedbackStatus={feedbackStatus}
      />
    </div>
  );
};

export const formItemFeedback = {
  key: 'FormItemFeedback',
  component: FormItemFeedback2Decorator,
};
