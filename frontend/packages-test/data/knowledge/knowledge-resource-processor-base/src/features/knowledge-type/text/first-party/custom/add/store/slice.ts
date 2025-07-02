import { type StateCreator } from 'zustand';

import {
  createTextSlice,
  getDefaultTextState,
} from '@/features/knowledge-type/text/slice';

import { TextCustomAddUpdateStep } from '../constants';
import {
  type UploadTextCustomAddUpdateStore,
  type UploadTextCustomAddUpdateState,
} from './types';

export const getDefaultTextCustomAddState: () => UploadTextCustomAddUpdateState =
  () => ({
    ...getDefaultTextState(),
    currentStep: TextCustomAddUpdateStep.UPLOAD_CONTENT,
    docName: '',
    docContent: '',
  });

export const createTextCustomAddUpdateSlice: StateCreator<
  UploadTextCustomAddUpdateStore
> = (set, ...arg) => ({
  ...createTextSlice(set, ...arg),
  // overwrite
  ...getDefaultTextCustomAddState(),
  // /** reset state */
  reset: () => {
    set(getDefaultTextCustomAddState());
  },
  setDocContent: (content: string) => {
    set({
      docContent: content,
    });
  },
  setDocName: (name: string) => {
    set({
      docName: name,
    });
  },
});
