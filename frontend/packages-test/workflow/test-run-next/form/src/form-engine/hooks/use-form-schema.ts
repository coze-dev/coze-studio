import { useContext } from 'react';

import { FormSchemaContext } from '../shared';

export const useFormSchema = () => useContext(FormSchemaContext);
