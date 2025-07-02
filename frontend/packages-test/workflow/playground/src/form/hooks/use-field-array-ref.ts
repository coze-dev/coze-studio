import { useRef } from 'react';

import { type FieldArrayInstance } from '../type';

export function useFieldArrayRef<T>() {
  const ref = useRef<FieldArrayInstance<T> | null>(null);

  return ref;
}
