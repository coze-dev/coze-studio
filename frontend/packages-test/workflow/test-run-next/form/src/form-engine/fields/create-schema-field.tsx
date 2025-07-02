import React from 'react';

import { type FormSchemaReactComponents } from '../types';
import { SchemaField, type SchemaFieldProps } from './schema-field';

interface CreateSchemaFieldOptions {
  components: FormSchemaReactComponents;
}

type InnerSchemaField = React.FC<
  Omit<SchemaFieldProps, 'components'> &
    Pick<Partial<SchemaFieldProps>, 'components'>
>;

export const createSchemaField = (options: CreateSchemaFieldOptions) => {
  const InnerSchemaField: InnerSchemaField = ({ components, ...props }) => (
    <SchemaField
      components={{
        ...options.components,
        ...components,
      }}
      {...props}
    />
  );

  return InnerSchemaField;
};
