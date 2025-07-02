import { createContext, useContext } from 'react';

import { type VariableGroup } from '../store';

interface VariableContextType {
  variablePageCanEdit?: boolean;
  groups: VariableGroup[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const VariableContext = createContext<VariableContextType>({
  groups: [],
});

export const useVariableContext = () => useContext(VariableContext);
