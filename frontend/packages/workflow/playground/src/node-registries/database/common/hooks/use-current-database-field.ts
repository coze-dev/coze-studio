import { useCurrentDatabaseQuery } from '@/hooks';

export function useCurrentDatabaseField(fieldID?: number) {
  const { data: currentDatabase } = useCurrentDatabaseQuery();
  return currentDatabase?.fields?.find(item => item.id === fieldID);
}
