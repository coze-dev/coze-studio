import { type ILevelSegmentsSlice } from '@coze-data/knowledge-stores';

import {
  type UploadTextStore,
  type UploadTextState,
  type LocalTextCustomResegmentState,
  type LocalTextCustomResegmentAction,
  type TextCustomResegmentState,
  type TextCustomResegmentAction,
} from '@/features/knowledge-type/text';

import { type TextLocalResegmentStep } from '../constants';
import { type IDocReviewSlice, type IDocReviewState } from './doc-review-slice';

export type UploadTextLocalResegmentState =
  UploadTextState<TextLocalResegmentStep> &
    LocalTextCustomResegmentState &
    TextCustomResegmentState &
    IDocReviewState;

export type UploadTextLocalResegmentStore =
  UploadTextStore<TextLocalResegmentStep> &
    LocalTextCustomResegmentState &
    LocalTextCustomResegmentAction &
    TextCustomResegmentState &
    TextCustomResegmentAction &
    IDocReviewSlice &
    ILevelSegmentsSlice;
