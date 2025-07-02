import { type StateCreator } from 'zustand';

import {
  createTableSlice,
  getDefaultState,
} from '@/features/knowledge-type/table/slice';
import type {
  UploadTableAction,
  UploadTableState,
} from '@/features/knowledge-type/table/interface';
import { DEFAULT_TABLE_SETTINGS_FROM_ZERO } from '@/constants';

export const createTableCustomSlice: StateCreator<
  UploadTableState<number> & UploadTableAction<number>
> = (set, get, store) => ({
  ...createTableSlice(set, get, store),
  tableSettings: DEFAULT_TABLE_SETTINGS_FROM_ZERO,
  reset: () => {
    set({
      ...getDefaultState(),
      tableSettings: DEFAULT_TABLE_SETTINGS_FROM_ZERO,
    });
  },
});
