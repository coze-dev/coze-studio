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
   * The id of the currently active doc review
   */
  currentReviewID?: string;
  /**
   * The ID of the currently selected segment
   */
  selectionIDs?: string[];
  /**
   * List of docReview
   */
  docReviewList: Review[];
}

export interface IDocReviewAction {
  /**
   * Set the id of the currently active doc review
   * @param id
   */
  setCurrentReviewID: (id: string) => void;
  /**
   * Sets the ID of the currently selected segment.
   * @param ids
   */
  setSelectionIDs: (ids: string[]) => void;
  /**
   * Set up a list of docReviews
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
