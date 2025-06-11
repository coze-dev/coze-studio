import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

type SetterProps<Value, CustomProps> = {
  value?: Value;
  onChange?: (value: Value) => void;
  readonly?: boolean;
  children?: React.ReactNode;
  context?: SetterComponentProps['context'];
  testId?: string;
} & CustomProps;

export type Setter<
  Value = unknown,
  CustomOptions = NonNullable<unknown>,
> = React.FC<SetterProps<Value, CustomOptions>>;
