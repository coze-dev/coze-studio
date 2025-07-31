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

import { useForm as useBaseForm } from '@flowgram-adapter/free-layout-editor';

import { type FormInstance } from '../type';
import { useFormContext } from '../contexts';

export function useForm<T = unknown>() {
  const baseForm = useBaseForm();
  const { readonly } = useFormContext();

  const form: FormInstance<T> = {
    getValueIn: baseForm.getValueIn.bind(baseForm),
    setValueIn: baseForm.setValueIn.bind(baseForm),
    validate: baseForm.validate?.bind(baseForm),
    values: baseForm.values,
    initialValues: baseForm.initialValues,
    state: baseForm.state,

    readonly,
    getFieldValue: baseForm.getValueIn.bind(baseForm),
    setFieldValue: baseForm.setValueIn.bind(baseForm),
  };

  return form;
}
