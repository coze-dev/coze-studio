import { useCurrentDatabaseQuery } from '@/hooks';

export function useTags(id?: string) {
  const { data } = useCurrentDatabaseQuery();
  return data?.fields?.map(({ name }) => name as string);
}
