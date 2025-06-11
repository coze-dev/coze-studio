import {
  type FieldInstance,
  type BaseFieldInstance,
  type BaseFieldState,
} from '../type';

export function baseFieldToField<T = unknown>(
  baseField: BaseFieldInstance<T>,
  baseFieldState?: BaseFieldState,
  readonly = false,
): FieldInstance<T> {
  const field: FieldInstance<T> = {
    key: baseField.key,
    value: baseField.value,
    name: baseField.name,
    onBlur: () => baseField.onBlur?.(),
    onFocus: () => baseField.onFocus?.(),

    readonly,
    errors: baseFieldState?.errors,
    onChange: (value?: T) => {
      if (readonly) {
        return;
      }

      baseField?.onChange(value as T);
    },
  };

  return field;
}
