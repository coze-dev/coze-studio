import { useContext } from 'react';

import { DataViewerContext, type DataViewerState } from '../context';

export const useDataViewerStore = <T>(selector: (s: DataViewerState) => T) => {
  const store = useContext(DataViewerContext);

  if (!store) {
    throw new Error('cant not found DataViewerContext');
  }

  return store(selector);
};
