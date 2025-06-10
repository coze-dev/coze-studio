import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

import {
  type UploadTableAction,
  type UploadTableState,
} from '@/features/knowledge-type/table/interface';

import { type TableCustomStep } from '../constant';
import { createTableCustomSlice } from './slice';

export const createTableCustomAddStore = () =>
  create<
    UploadTableState<TableCustomStep> & UploadTableAction<TableCustomStep>
  >()(
    devtools((set, get, store) => ({
      ...createTableCustomSlice(set, get, store),
    })),
  );
