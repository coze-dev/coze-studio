import { FieldArrayList, useFieldArray } from '@/form';

import { type QueryFieldSchema } from './types';
import { QueryFieldsItem } from './query-fields-item';

export function QueryFieldsList() {
  const { value } = useFieldArray<QueryFieldSchema>();

  return (
    <FieldArrayList>
      {value?.map((item, index) => <QueryFieldsItem index={index} />)}
    </FieldArrayList>
  );
}
