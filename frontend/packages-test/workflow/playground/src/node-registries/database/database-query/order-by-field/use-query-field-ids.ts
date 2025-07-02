import { useWatch } from '@/form';
import { queryFieldsFieldName } from '@/constants/database-field-names';

import { type QueryFieldSchema } from '../query-fields-field/types';

export function useQueryFieldIDs() {
  const queryFieldsFieldValue =
    useWatch<QueryFieldSchema[]>(queryFieldsFieldName);
  const selectedFieldIDs = queryFieldsFieldValue?.map(({ fieldID }) => fieldID);
  return selectedFieldIDs;
}
