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
