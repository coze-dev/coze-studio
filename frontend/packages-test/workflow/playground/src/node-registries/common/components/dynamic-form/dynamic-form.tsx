import { useMemo, type FC } from 'react';

import { Field } from '@/form';

import { type DynamicComponentProps, type FormMeta } from './types';

export interface DynamicFormProps {
  formMeta: FormMeta;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  components: Record<string, FC<DynamicComponentProps<any>>>;
  // 禁用做触发
  onChange?: () => void;
}

export const DynamicForm: FC<DynamicFormProps> = ({
  formMeta,
  name,
  components,
  onChange,
}) => {
  const fields = useMemo(
    () =>
      formMeta.map(field => {
        const Component =
          components[field.setter] ??
          (() => <div>component {field.setter} not exist</div>);

        return (
          <Field
            {...field}
            key={field.name}
            name={`${name}.${field.name}`}
            layout={field.layout ?? 'vertical'}
          >
            {({ value, onChange: _onChange, readonly }) => (
              <Component
                {...field.setterProps}
                value={value}
                onChange={(...args) => {
                  _onChange(...args);
                  onChange?.();
                }}
                readonly={readonly}
              />
            )}
          </Field>
        );
      }),
    [formMeta, name, components],
  );
  return <>{fields}</>;
};
