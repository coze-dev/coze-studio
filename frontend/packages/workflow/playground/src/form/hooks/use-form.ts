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
