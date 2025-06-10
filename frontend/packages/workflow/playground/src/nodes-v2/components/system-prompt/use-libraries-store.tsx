import { create } from 'zustand';
import type { ILibraryList } from '@coze-common/editor-plugins/library-insert';

interface LibrariesStore {
  libraries: ILibraryList;
  updateLibraries: (libraries: ILibraryList) => void;
}

export const useLibrariesStore = create<LibrariesStore>(set => ({
  libraries: [],
  updateLibraries: libraries =>
    set({
      libraries,
    }),
}));
