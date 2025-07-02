import { useEffect } from 'react';

import { useVariableGroupsStore } from '../../store';

export const useDestory = () => {
  const { clear } = useVariableGroupsStore();
  useEffect(
    () => () => {
      clear();
    },
    [clear],
  );
  return {
    clear,
  };
};
