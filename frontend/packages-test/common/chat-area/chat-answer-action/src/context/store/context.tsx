import { createContext } from 'react';

import { type StoreSet } from './type';

export const AnswerActionStoreContext = createContext<StoreSet | null>(null);
