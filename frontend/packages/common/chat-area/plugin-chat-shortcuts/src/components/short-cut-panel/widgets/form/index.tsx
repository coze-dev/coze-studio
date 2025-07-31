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

import { useRef } from 'react';

import { type FormApi } from '@coze-arch/bot-semi/Form';
import { Form } from '@coze-arch/bot-semi';

import { type DSLComponent, type TValue } from '../types';
import { findInputElementsWithDefault } from '../../../../utils/dsl-template';

type FormValue = Record<string, TValue>;
export const DSLForm: DSLComponent = ({
  context: { onChange, onSubmit, dsl },
  children,
}) => {
  const formRef = useRef<FormApi>();

  /**
   * Text type component interaction, support placeholder to represent default value
   * @param formValues
   */
  const onSubmitWrap = (formValues: FormValue) => {
    if (!onSubmit) {
      return;
    }
    const inputElementsWithDefault = findInputElementsWithDefault(dsl);

    const newValues = Object.entries(formValues).reduce(
      (prev: Record<string, TValue>, curr) => {
        const [field, value] = curr;
        const input = inputElementsWithDefault.find(i => i.id === field);

        if (input && !value) {
          prev[field] = input.defaultValue;
        } else {
          prev[field] = value;
        }

        return prev;
      },
      {},
    );

    inputElementsWithDefault.forEach(input => {
      const { id, defaultValue } = input;

      if (id && !(id in newValues)) {
        newValues[id] = defaultValue;
      }
    });

    onSubmit(newValues);
  };

  return (
    <Form<FormValue>
      className="w-full"
      autoComplete="off"
      getFormApi={api => (formRef.current = api)}
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      onChange={formState => onChange?.(formState.values!)}
      onSubmit={onSubmitWrap}
    >
      {children}
    </Form>
  );
};
