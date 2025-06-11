import {
  type FieldArrayInstance,
  type BaseFieldArrayInstance,
  type BaseFieldState,
  type BaseFieldInstance,
} from '../type';
import { baseFieldToField } from './base-field-to-field';

export function baseFieldArrayToFieldArray<T = unknown>(
  baseField: BaseFieldArrayInstance<T>,
  baseFieldState?: BaseFieldState,
  readonly = false,
): FieldArrayInstance<T> {
  const fieldArray = baseFieldToField(
    baseField as unknown as BaseFieldInstance<T[]>,
    baseFieldState,
    readonly,
  ) as FieldArrayInstance<T>;

  fieldArray.remove = (index: number) => baseField?.delete(index);
  fieldArray.delete = (index: number) => baseField?.delete(index);
  fieldArray.append = (newItem: T) => {
    baseField?.append(newItem);
  };
  fieldArray.move = (from: number, to: number) => baseField?.move(from, to);

  return fieldArray;
}
