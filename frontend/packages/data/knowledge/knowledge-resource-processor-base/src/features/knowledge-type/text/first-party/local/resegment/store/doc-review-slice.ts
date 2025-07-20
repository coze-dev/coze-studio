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
 
import { type StateCreator } from 'zustand';
import { type Review } from '@coze-arch/idl/knowledge';

export interface IDocReviewState {
  /**
   * 当前 active 的 doc review 的 id
   */
  currentReviewID?: string;
  /**
   * 当前选中的分段的 id
   */
  selectionIDs?: string[];
  /**
   * docReview 的列表
   */
  docReviewList: Review[];
}

export interface IDocReviewAction {
  /**
   * 设置当前 active 的 doc review 的 id
   * @param id
   */
  setCurrentReviewID: (id: string) => void;
  /**
   * 设置当前选中的分段的 id
   * @param ids
   */
  setSelectionIDs: (ids: string[]) => void;
  /**
   * 设置 docReview 的列表
   * @param list
   */
  setDocReviewList: (list: Review[]) => void;
}

export type IDocReviewSlice = IDocReviewState & IDocReviewAction;

export const getDefaultDocReviewState = () => ({
  currentReviewID: undefined,
  selectionID: undefined,
  docReviewList: [],
});

export const createDocReviewSlice: StateCreator<IDocReviewSlice> = set => ({
  ...getDefaultDocReviewState(),

  setCurrentReviewID: (id: string) => set(() => ({ currentReviewID: id })),
  setSelectionIDs: (ids: string[]) => set(() => ({ selectionIDs: ids })),
  setDocReviewList: (list: Review[]) => set(() => ({ docReviewList: list })),
});
