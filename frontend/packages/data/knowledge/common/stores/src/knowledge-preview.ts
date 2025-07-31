/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { type DocumentInfo, type Dataset } from '@coze-arch/bot-api/knowledge';

import {
  createLevelSegmentsSlice,
  getDefaultLevelSegmentsState,
  type ILevelSegmentsSlice,
} from './level-segments-slice';

export enum FilterPhotoType {
  /**
   * all
   */
  All = 'All',
  /**
   * marked
   */
  HasCaption = 'HasCaption',
  /**
   * unmarked
   */
  NoCaption = 'NoCaption',
}

export interface KnowledgePreviewState {
  canEdit?: boolean;
  dataSetDetail: Dataset;
  documentList: DocumentInfo[];
  searchValue: string;
  curDocId: string;
  /**
   * Is the image type marked?
   */
  photoFilterValue: FilterPhotoType;
}
export interface KnowledgePreviewAction {
  setCanEdit: (editable: boolean) => void;
  setDataSetDetail: (dataSet: Dataset) => void;
  setDocumentList: (documentList: DocumentInfo[]) => void;
  setSearchValue: (v: string) => void;
  setPhotoFilterValue: (v: FilterPhotoType) => void;
  setCurDocId: (curDocId: string) => void;
}

const getInitialState = (options?: { version?: string }) => ({
  canEdit: !options?.version,
  dataSetDetail: {},
  documentList: [],
  curDocId: '',
  searchValue: '',
  photoFilterValue: FilterPhotoType.All,
});

export const createKnowledgePreviewStore = (options?: { version?: string }) =>
  create<
    KnowledgePreviewState & KnowledgePreviewAction & ILevelSegmentsSlice
  >()(
    devtools(
      (set, get, ...args) => ({
        ...getInitialState(options),
        ...getDefaultLevelSegmentsState(),
        ...createLevelSegmentsSlice(set, get, ...args),
        setDataSetDetail: (dataSetDetail: Dataset) => {
          set({ dataSetDetail });
          set({ canEdit: dataSetDetail?.can_edit && !options?.version });
        },
        setDocumentList: (documentList: DocumentInfo[]) => {
          set({ documentList });
        },
        setSearchValue: (v: string) => {
          set({ searchValue: v });
        },
        setPhotoFilterValue: (v: FilterPhotoType) => {
          set({ photoFilterValue: v });
        },
        setCanEdit: editable => {
          set({ canEdit: editable });
        },
        setCurDocId: (curDocId: string) => {
          set({ curDocId });
        },
        reset: () => {
          set(getInitialState(options));
        },
      }),
      { name: 'DEV_TOOLS_NAME_SPACE', enabled: IS_DEV_MODE },
    ),
  );

export type KnowledgePreviewStore = ReturnType<
  typeof createKnowledgePreviewStore
>;
