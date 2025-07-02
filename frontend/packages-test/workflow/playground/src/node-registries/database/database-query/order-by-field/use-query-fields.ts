import { useCurrentDatabaseQuery } from '@/hooks';

import { useQueryFieldIDs } from './use-query-field-ids';

export function useQueryFields() {
  const queryFieldIDs = useQueryFieldIDs();
  const { data: currentDatabase } = useCurrentDatabaseQuery();
  const queryFields = currentDatabase?.fields?.filter(item =>
    queryFieldIDs?.includes(item.id),
  );
  return queryFields;
}
