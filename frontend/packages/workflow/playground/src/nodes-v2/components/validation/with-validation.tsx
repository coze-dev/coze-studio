import React from 'react';

import {
  type FieldError,
  useEntityFromContext,
  FlowNodeFormData,
  type FormModelV2,
} from '@flowgram-adapter/free-layout-editor';

import { ValidationProvider } from '@/form-extensions/components/validation';

export interface ValidationProps {
  errors?: FieldError[];
}

export function withValidation<T extends ValidationProps>(
  component: React.ComponentType<T>,
) {
  const Comp = component;

  return props => {
    const { errors: fieldErrors } = props;
    const errors = fieldErrors?.length
      ? JSON.parse(fieldErrors[0].message || '').issues
      : undefined;

    const node = useEntityFromContext();
    const formModel = node
      .getData<FlowNodeFormData>(FlowNodeFormData)
      .getFormModel<FormModelV2>();

    return (
      <ValidationProvider
        errors={errors}
        onTestRunValidate={callback => {
          // todo: 用 新formMode 的validate
          const { dispose } = formModel.onValidate(callback);
          return dispose;
        }}
      >
        <Comp {...props} />
      </ValidationProvider>
    );
  };
}
