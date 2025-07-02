import { useCurrentField } from '@flowgram-adapter/free-layout-editor';

import { type BaseFieldArrayInstance } from '../type';

export function useBaseFieldArray<T = unknown>() {
  const fieldArray = useCurrentField() as unknown as BaseFieldArrayInstance<T>;
  return fieldArray;
}
