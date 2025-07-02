import {
  type TextCustomResegmentAction,
  type TextCustomResegmentState,
  type LocalTextCustomResegmentAction,
  type LocalTextCustomResegmentState,
  type UploadTextState,
  type UploadTextStore,
} from '@/features/knowledge-type/text/index';

import { type TextResegmentStep } from '../constants';

export type UploadTextResegmentState = UploadTextState<TextResegmentStep> &
  LocalTextCustomResegmentState &
  TextCustomResegmentState;

export type UploadTextResegmentStore = UploadTextStore<TextResegmentStep> &
  LocalTextCustomResegmentState &
  LocalTextCustomResegmentAction &
  TextCustomResegmentState &
  TextCustomResegmentAction;
