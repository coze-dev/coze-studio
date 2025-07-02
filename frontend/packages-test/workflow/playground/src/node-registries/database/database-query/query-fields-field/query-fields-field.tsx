import { FieldArray, type FieldProps } from '@/form';

import { QueryFields } from './query-fields';

export function QueryFieldsField({ name }: Pick<FieldProps, 'name'>) {
  return (
    <FieldArray name={name}>
      <QueryFields />
    </FieldArray>
  );
}
