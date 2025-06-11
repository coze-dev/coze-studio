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
