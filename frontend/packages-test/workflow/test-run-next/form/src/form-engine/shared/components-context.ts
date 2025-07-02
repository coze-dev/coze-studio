import { createContext } from 'react';

import type { FormSchemaReactComponents } from '../types';

export const ComponentsContext = createContext<FormSchemaReactComponents>({});
