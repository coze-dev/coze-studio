import React, { useEffect, useMemo } from 'react';

import { type Field } from '../types';
import { createDataViewerStore } from './create-store';
import { DataViewerContext } from './context';

interface DataViewerProviderProps {
  fields: Field[];
}

export const DataViewerProvider: React.FC<
  React.PropsWithChildren<DataViewerProviderProps>
> = ({ children, fields }) => {
  const store = useMemo(() => createDataViewerStore(), []);

  // 根只有一项且其可以下钻时，默认展开它
  useEffect(() => {
    if (
      store.getState().expand === null &&
      fields.length === 1 &&
      fields[0]?.isObj
    ) {
      store.setState({
        [fields[0].path.join('.')]: true,
      });
    }
  }, [fields, store]);

  return (
    <DataViewerContext.Provider value={store}>
      {children}
    </DataViewerContext.Provider>
  );
};
