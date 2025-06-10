import { createContext } from 'react';

import { type DataViewerStore } from './create-store';

export const DataViewerContext = createContext<DataViewerStore | null>(null);
