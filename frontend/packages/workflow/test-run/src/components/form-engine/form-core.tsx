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

import { useMemo, forwardRef, useImperativeHandle } from 'react';

import { useMemoizedFn } from 'ahooks';
import {
  createSchemaField,
  FormProvider,
  type ISchema,
  type JSXComponent,
} from '@formily/react';
import {
  createForm,
  onFormValuesChange as innerOnFormValuesChange,
  type Form,
} from '@formily/core';

import {
  Input,
  FileUpload,
  Switch,
  InputInteger,
  InputNumber,
  FormItem,
  FormSection,
  VoiceSelect,
  TextArea,
  FullInput,
  InputTime,
} from '../form-materials';

const SchemaField = createSchemaField({
  components: {
    Input,
    InputInteger,
    InputNumber,
    FormItem,
    FormSection,
    FileUpload,
    Switch,
    VoiceSelect,
    TextArea,
    FullInput,
    InputTime,
  },
});

interface FormCoreProps {
  schema: ISchema;
  components?: Record<string, JSXComponent>;
  disabled?: boolean;
  initialValues?: any;
  onFormValuesChange?: (form: Form) => void;
}

type FormCoreRef = Form<any>;

const FormCore = forwardRef<FormCoreRef, FormCoreProps>(
  (
    { schema, components, initialValues, disabled, onFormValuesChange },
    ref,
  ) => {
    const handleFormChange = useMemoizedFn((f: Form) => {
      onFormValuesChange?.(f);
    });

    const form = useMemo(
      () =>
        createForm({
          initialValues,
          disabled,
          effects() {
            innerOnFormValuesChange(handleFormChange);
          },
        }),
      [],
    );

    useImperativeHandle(ref, () => form, [form]);

    return (
      <FormProvider form={form}>
        <SchemaField components={components} schema={schema} />
      </FormProvider>
    );
  },
);

export type { FormCoreProps, FormCoreRef };

export { FormCore, SchemaField };

export default FormCore;
