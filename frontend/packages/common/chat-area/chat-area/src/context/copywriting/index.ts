import { useContext } from 'react';

import { CopywritingContext } from './copywriting-context';

export const useCopywriting = () => useContext(CopywritingContext);
