import { type FieldArrayInstance } from '../type';
import { useFieldArrayContext } from '../contexts';

export function useFieldArray<T = unknown>() {
  const fieldArray = useFieldArrayContext() as FieldArrayInstance<T>;

  return fieldArray;
}
