import React from 'react';

import { TextArea as UITextArea } from '@coze-arch/coze-design';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TextAreaProps = SetterComponentProps<any, { max?: number }>;

export const TextArea = ({
  value,
  onChange,
  options,
  readonly,
}: TextAreaProps) => {
  const { key, max, ...others } = options;

  return (
    <UITextArea
      {...others}
      readonly={readonly}
      value={value}
      onChange={onChange}
      maxCount={max}
      maxLength={max}
    />
  );
};

export const textArea = {
  key: 'TextArea',
  component: TextArea,
};
