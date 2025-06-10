import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

import { type TableLocalStep } from '../constants';
import { createTableSlice } from '../../../slice';
import {
  type UploadTableAction,
  type UploadTableState,
} from '../../../interface';

export const createTableLocalIncrementalStore = () =>
  create<
    UploadTableState<TableLocalStep> & UploadTableAction<TableLocalStep>
  >()(
    devtools((set, get, store) => ({
      ...createTableSlice(set, get, store),
    })),
  );
