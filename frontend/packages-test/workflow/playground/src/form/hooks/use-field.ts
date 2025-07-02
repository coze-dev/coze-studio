import { type FieldInstance } from '../type';
import { useFieldContext } from '../contexts';

export function useField<T = unknown>() {
  const field = useFieldContext() as FieldInstance<T>;

  return field;
}
