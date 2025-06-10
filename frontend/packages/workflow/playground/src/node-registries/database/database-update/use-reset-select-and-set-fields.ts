import { useForm } from '@/form';
import { updateSelectAndSetFieldsFieldName } from '@/constants/database-field-names';

export function useResetSelectAndSetFields() {
  const form = useForm();
  return () => {
    form.setFieldValue(updateSelectAndSetFieldsFieldName, undefined);
  };
}
