import { Field, type FieldProps } from '../components';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withField<T = {}, V = any>(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Cpt: React.ComponentType<T>,
  config: Omit<FieldProps<V>, 'name' | 'children'> = {},
) {
  const Component = (props: T & FieldProps<V>) => {
    const innerProps = {
      ...config,
      ...props,
    };

    const {
      label,
      required,
      tooltip,
      layout,
      defaultValue,
      name,
      deps,
      labelExtra,
      hasFeedback,
      ...rest
    } = innerProps;

    return (
      <Field<V>
        name={name}
        label={label}
        required={required}
        tooltip={tooltip}
        layout={layout}
        defaultValue={defaultValue}
        deps={deps}
        labelExtra={labelExtra}
        hasFeedback={hasFeedback}
      >
        <Cpt {...(rest as T & React.JSX.IntrinsicAttributes)} />
      </Field>
    );
  };

  Component.displayName = `withField(${Cpt.displayName || 'Anonymous'})`;

  return Component;
}
