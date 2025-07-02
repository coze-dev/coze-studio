import { useObserve } from '@flowgram-adapter/common';

import { useFieldSchema } from './use-field-schema';

export const useFieldUIState = () => {
  const schema = useFieldSchema();
  return useObserve(schema?.uiState?.value);
};
