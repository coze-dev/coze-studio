import React from 'react';

import type { FormSchemaReactComponents } from '../types';
import {
  ComponentsContext,
  FormSchemaContext,
  type FormSchema,
} from '../shared';
import { RecursionField } from './recursion-field';

export interface SchemaFieldProps {
  schema: FormSchema;
  components: FormSchemaReactComponents;
}

export const SchemaField: React.FC<SchemaFieldProps> = props => (
  <ComponentsContext.Provider value={props.components}>
    <FormSchemaContext.Provider value={props.schema}>
      <RecursionField schema={props.schema} />
    </FormSchemaContext.Provider>
  </ComponentsContext.Provider>
);
