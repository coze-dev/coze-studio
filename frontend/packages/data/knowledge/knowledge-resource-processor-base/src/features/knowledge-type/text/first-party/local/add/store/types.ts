import { type ILevelSegmentsSlice } from '@coze-data/knowledge-stores';

import {
  type UploadTextStore,
  type UploadTextState,
  type LocalTextCustomResegmentState,
  type LocalTextCustomResegmentAction,
} from '@/features/knowledge-type/text/interface';

import { type TextLocalAddUpdateStep } from '../constants';
import { type IDocReviewSlice, type IDocReviewState } from './doc-review-slice';

export type UploadTextLocalAddUpdateState =
  UploadTextState<TextLocalAddUpdateStep> &
    LocalTextCustomResegmentState &
    IDocReviewState;

export type UploadTextLocalAddUpdateStore =
  UploadTextStore<TextLocalAddUpdateStep> &
    LocalTextCustomResegmentState &
    LocalTextCustomResegmentAction &
    IDocReviewSlice &
    ILevelSegmentsSlice;
