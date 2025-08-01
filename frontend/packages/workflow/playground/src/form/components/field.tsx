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

import { Field as BaseField } from '@flowgram-adapter/free-layout-editor';

import { baseFieldToField } from '../utils';
import { type FieldName, type FieldInstance } from '../type';
import { FieldProvider, useFormContext } from '../contexts';
import { FieldLayout, type FieldLayoutProps } from './field-layout';
import { Feedback } from './feedback';

export interface FieldProps<T = unknown>
  extends Omit<FieldLayoutProps, 'children'> {
  name: string;
  layout?: 'vertical' | 'horizontal';
  deps?: FieldName[];
  defaultValue?: T;
  hasFeedback?: boolean;
  children?: ((field: FieldInstance<T>) => React.ReactNode) | React.ReactNode;
  readonly?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Field = <T = any,>({
  label,
  labelExtra,
  name,
  tooltip,
  required = false,
  hasFeedback = true,
  children,
  layout = 'horizontal',
  deps,
  defaultValue,
  readonly = false,
}: FieldProps<T>) => {
  let field: FieldInstance<T> | undefined = undefined;
  const { readonly: formReadonly } = useFormContext();

  return (
    <BaseField name={name} deps={deps} defaultValue={defaultValue}>
      {({ field: baseField, fieldState }) => {
        field = baseFieldToField(
          baseField,
          fieldState,
          readonly || formReadonly,
        );

        if (!children) {
          return <></>;
        }

        return (
          <FieldProvider value={field as FieldInstance<unknown>}>
            <FieldLayout
              label={label}
              labelExtra={labelExtra}
              tooltip={tooltip}
              required={required}
              layout={layout}
            >
              {typeof children === 'function' ? children(field) : children}
              {hasFeedback ? (
                <Feedback text={field.errors?.[0]?.message} />
              ) : null}
            </FieldLayout>
          </FieldProvider>
        );
      }}
    </BaseField>
  );
};
