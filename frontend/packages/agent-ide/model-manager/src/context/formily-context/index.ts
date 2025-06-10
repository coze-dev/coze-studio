import { useContext } from 'react';

import { FormilyContext } from './context';

export const useFormily = () => {
  const context = useContext(FormilyContext);
  return context;
};
