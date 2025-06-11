import { createContext } from 'react';

import type { FormSchema } from './form-schema';

export const SchemaContext = createContext<FormSchema>({} as any);

export const FormSchemaContext = createContext<FormSchema>({} as any);
