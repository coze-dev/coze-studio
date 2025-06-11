import { useRef } from 'react';

import { type FieldInstance } from '../type';

export function useFieldRef<T>() {
  const ref = useRef<FieldInstance<T> | null>(null);

  return ref;
}
