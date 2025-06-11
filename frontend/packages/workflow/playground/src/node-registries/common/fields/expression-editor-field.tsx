import React from 'react';

import {
  ExpressionEditor as ExpressionEditorLeagcy,
  type ExpressionEditorProps,
} from '@/nodes-v2/components/expression-editor';
import { useField, withField } from '@/form';

type ExpressionEditorFieldProps = Omit<
  ExpressionEditorProps,
  'value' | 'onChange' | 'onBlur' | 'onFocus'
> & {
  dataTestName?: string;
};

function ExpressionEditor(props: ExpressionEditorFieldProps) {
  const { name, value, onChange, errors, onBlur, readonly } =
    useField<string>();

  return (
    <ExpressionEditorLeagcy
      {...props}
      name={props?.dataTestName ?? name}
      value={value as string}
      onChange={e => onChange(e as string)}
      isError={errors && errors?.length > 0}
      onBlur={onBlur}
      disableSuggestion={readonly}
    />
  );
}

export const ExpressionEditorField = withField(ExpressionEditor);
