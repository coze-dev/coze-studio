import React from 'react';

import { Field } from '@flowgram-adapter/free-layout-editor';

import { SchemaContext, type FormSchema } from '../shared';
import { useFieldUIState } from '../hooks';
import { ReactiveField } from './reactive-field';

interface FieldProps {
  name: string;
  schema: FormSchema;
}

export const GeneralField: React.FC<React.PropsWithChildren<FieldProps>> = ({
  schema,
}) => {
  const parentUIState = useFieldUIState();
  return (
    <SchemaContext.Provider value={schema}>
      <Field name={schema.path.join('.')} defaultValue={schema.defaultValue}>
        <ReactiveField parentUIState={parentUIState} />
      </Field>
    </SchemaContext.Provider>
  );
};
