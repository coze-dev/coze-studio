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

import { Form, type FormModel } from '@flowgram-adapter/free-layout-editor';

import {
  InputString,
  InputNumber,
  InputInteger,
  InputJson,
  SelectBoolean,
  SelectVoice,
  InputTime,
  FieldItem,
} from '../form-materials';
import {
  createSchemaField,
  type FormSchema,
  useCreateForm,
  type IFormSchema,
  type FormSchemaReactComponents,
} from '../../form-engine';

const SchemaField = createSchemaField({
  components: {
    InputString,
    InputNumber,
    InputInteger,
    InputTime,
    InputJson,
    SelectBoolean,
    SelectVoice,
    FieldItem,
  },
});

interface TestRunFormProps {
  schema: IFormSchema;
  components?: FormSchemaReactComponents;
  onFormValuesChange?: (payload: any) => void;
  onMounted?: (formModel: FormModel, schema: FormSchema) => void;
}

export const TestRunForm: React.FC<TestRunFormProps> = ({
  schema,
  components,
  onFormValuesChange,
  onMounted,
}) => {
  const { control, formSchema } = useCreateForm(schema, {
    onFormValuesChange,
    onMounted,
  });
  return (
    <Form control={control}>
      <SchemaField schema={formSchema} components={components} />
    </Form>
  );
};
