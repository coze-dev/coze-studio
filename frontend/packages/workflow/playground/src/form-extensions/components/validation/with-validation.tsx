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

import { useEffect } from 'react';

import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { ValidationProvider } from './context';

type ValidationProps = Pick<
  SetterComponentProps,
  | 'children'
  | 'feedbackStatus'
  | 'feedbackText'
  | 'value'
  | 'onChange'
  | 'flowNodeEntity'
>;

export function withValidation<T extends ValidationProps>(
  component: React.ComponentType<T>,
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Comp = component as any;

  return (props: SetterComponentProps) => {
    const { value, onChange, context } = props;

    useEffect(() => {
      // Trigger a verification during initialization to prevent the component onBlur from not getting the verification information.
      onChange && onChange(value);
    }, []);

    return (
      <ValidationProvider
        errors={[]}
        onTestRunValidate={callback => {
          const { dispose } = context.onFormValidate(callback);
          return dispose;
        }}
      >
        <Comp {...props} />
      </ValidationProvider>
    );
  };
}
