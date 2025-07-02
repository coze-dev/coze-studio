import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

import {
  type UploadTableAction,
  type UploadTableState,
} from '@/features/knowledge-type/table/index';

import { type TableLocalResegmentStep } from '../constants';
import { createTableLocalResegmentSlice } from './slice';

export const createTableLocalResegmentStore = () =>
  create<
    UploadTableState<TableLocalResegmentStep> &
      UploadTableAction<TableLocalResegmentStep>
  >()(
    devtools((set, get, store) => ({
      ...createTableLocalResegmentSlice(set, get, store),
    })),
  );
