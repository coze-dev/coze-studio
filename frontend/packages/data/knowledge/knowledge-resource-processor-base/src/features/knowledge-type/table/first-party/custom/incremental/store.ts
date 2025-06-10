import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

import { createTableSlice } from '../../../slice';
import {
  type UploadTableAction,
  type UploadTableState,
} from '../../../interface';
import { type TableCustomIncrementalStep } from './constants';

export const createTableCustomIncrementalStore = () =>
  create<
    UploadTableState<TableCustomIncrementalStep> &
      UploadTableAction<TableCustomIncrementalStep>
  >()(
    devtools((set, get, store) => ({
      ...createTableSlice(set, get, store),
    })),
  );
