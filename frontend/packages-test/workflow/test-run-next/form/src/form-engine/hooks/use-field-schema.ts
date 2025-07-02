import { useContext } from 'react';

import { SchemaContext } from '../shared';

export const useFieldSchema = () => useContext(SchemaContext);
