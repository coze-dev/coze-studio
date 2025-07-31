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

export interface FormItemMeta {
  name: string;
  label: string;
  required?: boolean;
  setter: string;
  setterProps?: {
    defaultValue?: unknown;
    [k: string]: unknown;
  };
  layout?: 'horizontal' | 'vertical';
}

export type FormMeta = FormItemMeta[];

export interface DynamicComponentProps<T> {
  value?: T; // field value
  readonly?: boolean; // Is it read-only?
  disabled?: boolean; // Whether to disable
  onChange: (newValue?: T) => void;
}
