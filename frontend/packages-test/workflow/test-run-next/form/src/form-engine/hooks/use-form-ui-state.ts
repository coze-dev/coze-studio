import { useObserve } from '@flowgram-adapter/common';

import { useFormSchema } from './use-form-schema';

export const useFormUIState = () => {
  const schema = useFormSchema();
  return useObserve(schema?.uiState?.value);
};
