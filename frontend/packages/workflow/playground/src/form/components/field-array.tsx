import { FieldArray as BaseFieldArray } from '@flowgram-adapter/free-layout-editor';

import { baseFieldArrayToFieldArray } from '../utils';
import { type BaseFieldArrayInstance, type FieldArrayInstance } from '../type';
import { FieldArrayProvider, useFormContext } from '../contexts';
import { type FieldProps } from './field';

export interface FieldArrayProps<T = unknown>
  extends Omit<FieldProps<T[]>, 'label' | 'children'> {
  children:
    | ((fieldArray: FieldArrayInstance<T>) => React.ReactNode)
    | React.ReactNode;
  readonly?: boolean;
}

/**
 * @deprecated
 * 这个组件会导致数组表单项删除后index错乱，请直接使用:
 *
 * `import { FieldArray } from '@flowgram-adapter/free-layout-editor'`
 */
export const FieldArray = <T = unknown,>({
  name,
  children,
  defaultValue,
  readonly = false,
  deps,
}: FieldArrayProps<T>) => {
  let fieldArray: FieldArrayInstance<T> | undefined = undefined;
  const { readonly: formReadonly } = useFormContext();
  return (
    <BaseFieldArray name={name} defaultValue={defaultValue} deps={deps}>
      {({ field, fieldState }) => {
        fieldArray = baseFieldArrayToFieldArray<T>(
          field as unknown as BaseFieldArrayInstance<T>,
          fieldState,
          readonly || formReadonly,
        );

        return (
          <FieldArrayProvider value={fieldArray as FieldArrayInstance<unknown>}>
            {typeof children === 'function' ? children(fieldArray) : children}
          </FieldArrayProvider>
        );
      }}
    </BaseFieldArray>
  );
};
