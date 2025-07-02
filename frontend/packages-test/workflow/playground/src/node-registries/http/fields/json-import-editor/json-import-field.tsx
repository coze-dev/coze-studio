import { useField, withField } from '@/form';

import { JsonImport } from './json-import-components';

export const JsonImportField = withField(() => {
  const { value, onChange, onBlur, readonly } = useField<string>();

  return (
    <JsonImport
      value={value as string}
      onChange={onChange}
      onBlur={onBlur}
      disabled={readonly}
    />
  );
});
