import { useContext } from 'react';

import { ComponentsContext } from '../shared';

export const useComponents = () => useContext(ComponentsContext);
