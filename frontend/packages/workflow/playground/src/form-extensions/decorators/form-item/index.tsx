import { type FC } from 'react';

import { type DecoratorComponentProps } from '@flowgram-adapter/free-layout-editor';

import { FormItem, type FormItemProps } from '../../components/form-item';

const FormItem2Decorator: FC<
  DecoratorComponentProps<
    { key: string } & Omit<FormItemProps, 'title' | 'required'>
  >
> = props => {
  const { children, feedbackText, feedbackStatus, formItemMeta, options } =
    props;
  const { title, required, description } = formItemMeta;

  const { key, ...others } = options;
  return (
    <FormItem
      label={title}
      required={required}
      tooltip={description}
      feedbackText={feedbackText}
      feedbackStatus={feedbackStatus}
      {...others}
    >
      {children}
    </FormItem>
  );
};

export const formItem = {
  key: 'FormItem',
  component: FormItem2Decorator,
};
