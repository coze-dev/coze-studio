import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

import { FileBoxListType } from './types';

interface FileBoxListState {
  fileListType: FileBoxListType;
  searchValue: string;
}

interface FileBoxListAction {
  setFileListType: (v: FileBoxListType) => void;
  setSearchValue: (v: string) => void;
}

export const useFileBoxListStore = create<
  FileBoxListState & FileBoxListAction
>()(
  devtools((set, get) => ({
    fileListType: FileBoxListType.Image,
    searchValue: '',
    setFileListType: (v: FileBoxListType) => {
      set({ fileListType: v });
    },
    setSearchValue: (v: string) => {
      set({ searchValue: v });
    },
  })),
);
