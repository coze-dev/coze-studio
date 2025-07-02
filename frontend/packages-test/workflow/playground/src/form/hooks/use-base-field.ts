import { useCurrentField } from '@flowgram-adapter/free-layout-editor';

import { type BaseFieldInstance } from '../type';

export function useBaseField<T = unknown>() {
  const field = useCurrentField() as unknown as BaseFieldInstance<T>;
  return field;
}
