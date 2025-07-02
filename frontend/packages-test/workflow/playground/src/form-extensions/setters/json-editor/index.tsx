import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

import { JsonEditorAdapter } from '@/components/test-run/test-form-materials/json-editor';

type SwitchProps = SetterComponentProps;

const JSONEditorSetter = ({
  value,
  onChange,
  options,
  readonly,
}: SwitchProps) => {
  const { defaultValue } = options;

  return (
    <JsonEditorAdapter
      // className={styles['json-editor']}
      value={value ?? ''}
      options={{
        quickSuggestions: false,
        suggestOnTriggerCharacters: false,
      }}
      onChange={onChange}
      disabled={readonly}
      height={264}
      defaultValue={defaultValue}
    />
  );
};

export const jsonEditor = {
  key: 'JSONEditor',
  component: JSONEditorSetter,
};
