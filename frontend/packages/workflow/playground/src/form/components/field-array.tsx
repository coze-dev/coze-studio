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

import { FieldArray as BaseFieldArray } from '@flowgram-adapter/free-layout-editor';

import { baseFieldArrayToFieldArray } from '../utils';
import { type BaseFieldArrayInstance, type FieldArrayInstance } from '../type';
import { FieldArrayProvider, useFormContext } from '../contexts';
import { type FieldProps } from './field';

export interface FieldArrayProps<T = unknown>
  extends Omit<FieldProps<T[]>, 'label' | 'children'> {
  children:
    | ((fieldArray: FieldArrayInstance<T>) => React.ReactNode)
    | React.ReactNode;
  readonly?: boolean;
}

/**
 * @deprecated
 * This component will cause the index to be confused after the array list entry is deleted, please use it directly:
 *
 * `import { FieldArray } from '@flowgram-adapter/free-layout-editor'`
 */
export const FieldArray = <T = unknown,>({
  name,
  children,
  defaultValue,
  readonly = false,
  deps,
}: FieldArrayProps<T>) => {
  let fieldArray: FieldArrayInstance<T> | undefined = undefined;
  const { readonly: formReadonly } = useFormContext();
  return (
    <BaseFieldArray name={name} defaultValue={defaultValue} deps={deps}>
      {({ field, fieldState }) => {
        fieldArray = baseFieldArrayToFieldArray<T>(
          field as unknown as BaseFieldArrayInstance<T>,
          fieldState,
          readonly || formReadonly,
        );

        return (
          <FieldArrayProvider value={fieldArray as FieldArrayInstance<unknown>}>
            {typeof children === 'function' ? children(fieldArray) : children}
          </FieldArrayProvider>
        );
      }}
    </BaseFieldArray>
  );
};
