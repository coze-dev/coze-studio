/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
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
