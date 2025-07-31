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
          const { dispose } = formModel.onValidate(callback);
          return dispose;
        }}
      >
        <Comp {...props} />
      </ValidationProvider>
    );
  };
}
