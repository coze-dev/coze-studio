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

import {
  type FieldError,
  type FieldName,
  type IForm,
  type IField,
  type IFieldArray,
  type FieldState,
} from '@flowgram-adapter/free-layout-editor';

export {
  type FieldError,
  type FieldName,
} from '@flowgram-adapter/free-layout-editor';

export type BaseForm<T = unknown> = IForm<T>;
export type BaseFieldInstance<T = unknown> = IField<T>;
export type BaseFieldArrayInstance<T = unknown> = IFieldArray<T>;
export type BaseFieldState = FieldState;
export interface FieldInstance<FieldValue = unknown>
  extends Omit<BaseFieldInstance<FieldValue>, 'onChange'> {
  /**
   * Array of error information for the field.
   */
  errors?: FieldError[];

  /**
   * Indicates whether the field is read-only.
   */
  readonly?: boolean;

  /**
   * Sets the value of the field.
   * The value of the @param value field.
   */
  onChange: (value?: FieldValue) => void;
}

export interface FieldArrayInstance<FieldValue = unknown>
  extends Omit<BaseFieldArrayInstance<FieldValue>, 'append'> {
  /**
   * Indicates whether the field is read-only.
   */
  readonly?: boolean;

  /**
   * Remove list item
   * @Param index The index of the field to remove.
   */
  remove: (index: number) => void;

  /**
   * Add a new field.
   * @Param newItem The new field to add.
   */
  append: (newItem: FieldValue) => void;
}

export interface FormInstance<FormValues = unknown>
  extends BaseForm<FormValues> {
  /**
   * Indicates whether the field is read-only.
   */
  readonly?: boolean;

  /**
   * @Deprecated Please use'getValueIn 'instead.
   */
  getFieldValue: <FieldValue = unknown>(
    name: FieldName,
  ) => FieldValue | undefined;
  /**
   * @Deprecated Please use'setValueIn 'instead.
   */
  setFieldValue: <FieldValue = unknown>(
    name: FieldName,
    value: FieldValue,
  ) => void;
}

export interface SectionRefType {
  open: () => void;
  close: () => void;
}
