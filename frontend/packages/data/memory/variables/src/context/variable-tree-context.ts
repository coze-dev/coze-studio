import { createContext, useContext } from 'react';

import { type Variable } from '../store';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const VariableTreeContext = createContext<{
  groupId: string;
  variables: Variable[];
}>({
  groupId: '',
  variables: [],
});

export const useVariableTreeContext = () => useContext(VariableTreeContext);
