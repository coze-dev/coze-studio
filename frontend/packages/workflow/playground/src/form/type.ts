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
   * 字段的错误信息数组。
   */
  errors?: FieldError[];

  /**
   * 表示该字段是否为只读状态。
   */
  readonly?: boolean;

  /**
   * 设置字段的值。
   * @param value 字段的值。
   */
  onChange: (value?: FieldValue) => void;
}

export interface FieldArrayInstance<FieldValue = unknown>
  extends Omit<BaseFieldArrayInstance<FieldValue>, 'append'> {
  /**
   * 表示该字段是否为只读状态。
   */
  readonly?: boolean;

  /**
   * 移除列表项
   * @param index 要移除的字段的索引。
   */
  remove: (index: number) => void;

  /**
   * 添加一个新的字段。
   * @param newItem 要添加的新字段。
   */
  append: (newItem: FieldValue) => void;
}

export interface FormInstance<FormValues = unknown>
  extends BaseForm<FormValues> {
  /**
   * 表示该字段是否为只读状态。
   */
  readonly?: boolean;

  /**
   * @deprecated 请使用 `getValueIn` 代替。
   */
  getFieldValue: <FieldValue = unknown>(
    name: FieldName,
  ) => FieldValue | undefined;
  /**
   * @deprecated 请使用 `setValueIn` 代替。
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
