import { FormSchema } from '../shared';
import { ObjectField } from './object-field';
import { GeneralField } from './general-field';

interface RecursionFieldProps {
  schema: FormSchema;
  name?: string;
}

const computePath = (path?: string[], name?: string) =>
  [...(path || []), name].filter((i): i is string => Boolean(i));

/**
 * 递归 Field
 */
const RecursionField: React.FC<RecursionFieldProps> = ({ name, schema }) => {
  const renderProperties = () => {
    const properties = FormSchema.getProperties(schema);
    if (!properties.length) {
      return null;
    }
    const { path } = schema;
    return (
      <ObjectField schema={schema}>
        {properties.map((item, index) => (
          <RecursionField
            name={item.key}
            schema={new FormSchema(item.schema, computePath(path, item.key))}
            key={`${index}-${item.key}`}
          />
        ))}
      </ObjectField>
    );
  };

  if (!name) {
    return renderProperties();
  }
  if (schema.type === 'object') {
    return renderProperties();
  }

  return <GeneralField name={name} schema={schema} />;
};

export { RecursionField, type RecursionFieldProps };
