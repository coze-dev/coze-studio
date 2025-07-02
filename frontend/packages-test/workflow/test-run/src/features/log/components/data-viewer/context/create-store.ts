import {
  createWithEqualityFn,
  type UseBoundStoreWithEqualityFn,
} from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { type StoreApi } from 'zustand';

export interface DataViewerState {
  // 折叠展开的状态
  expand: Record<string, boolean> | null;
  setExpand: (key: string, v: boolean) => void;
}

export type DataViewerStore = UseBoundStoreWithEqualityFn<
  StoreApi<DataViewerState>
>;

export const createDataViewerStore = () =>
  createWithEqualityFn<DataViewerState>(
    set => ({
      expand: null,
      setExpand: (key: string, v: boolean) => {
        set(state => ({
          expand: {
            ...state.expand,
            [key]: v,
          },
        }));
      },
    }),
    shallow,
  );
