import { FieldArray, type FieldArrayProps } from '../components';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withFieldArray<ComponentProps = {}, FieldArrayItemValue = any>(
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Cpt: React.ComponentType<ComponentProps>,
) {
  return (
    props: ComponentProps &
      Omit<FieldArrayProps<FieldArrayItemValue>, 'children'>,
  ) => {
    const { name, defaultValue, deps, ...rest } = props;

    return (
      <FieldArray<FieldArrayItemValue>
        name={name}
        defaultValue={defaultValue}
        deps={deps}
      >
        <Cpt {...(rest as ComponentProps & React.JSX.IntrinsicAttributes)} />
      </FieldArray>
    );
  };
}
