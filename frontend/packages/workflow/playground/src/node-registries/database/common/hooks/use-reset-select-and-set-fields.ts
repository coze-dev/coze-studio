import { useCurrentDatabaseQuery } from '@/hooks';
import { useForm } from '@/form';

export function useResetSelectAndSetFields(name: string) {
  const { data: currentDatabase } = useCurrentDatabaseQuery();
  const form = useForm();

  return () => {
    const newSelectFieldSchemas =
      currentDatabase?.fields
        ?.filter(({ required }) => required)
        ?.map(({ id }) => ({
          fieldID: id,
        })) || [];

    form.setFieldValue(name, newSelectFieldSchemas);
  };
}
