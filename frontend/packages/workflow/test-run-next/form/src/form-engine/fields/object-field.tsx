import React from 'react';

import { SchemaContext, type FormSchema } from '../shared';
import { useComponents } from '../hooks';

interface ObjectFieldProps {
  schema: FormSchema;
}

export const ObjectField: React.FC<
  React.PropsWithChildren<ObjectFieldProps>
> = ({ schema, children }) => {
  const components = useComponents();
  const renderDecorator = () => {
    if (!schema.decoratorType || !components[schema.decoratorType]) {
      return <>{children}</>;
    }
    return React.createElement(
      components[schema.decoratorType],
      schema.decoratorProps,
      children,
    );
  };

  return (
    <SchemaContext.Provider value={schema}>
      {renderDecorator()}
    </SchemaContext.Provider>
  );
};
