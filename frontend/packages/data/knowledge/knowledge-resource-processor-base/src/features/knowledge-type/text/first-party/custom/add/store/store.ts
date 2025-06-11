import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

import { type UploadTextCustomAddUpdateStore } from './types';
import { createTextCustomAddUpdateSlice } from './slice';

export const createTextCustomAddUpdateStore = () =>
  create<UploadTextCustomAddUpdateStore>()(
    devtools((set, get, store) => ({
      ...createTextCustomAddUpdateSlice(set, get, store),
    })),
  );
