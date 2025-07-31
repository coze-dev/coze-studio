/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
 * Recursive Field
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
