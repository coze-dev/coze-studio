import {
  type UploadTextState,
  type UploadTextAction,
} from '@/features/knowledge-type/text/interface';

import { type TextCustomAddUpdateStep } from '../constants';

export type UploadTextCustomAddUpdateState =
  UploadTextState<TextCustomAddUpdateStep> & {
    docName: string;
    docContent: string;
  };
export type UploadTextCustomAddUpdateAction =
  UploadTextAction<TextCustomAddUpdateStep> & {
    setDocName: (unitName: string) => void;
    setDocContent: (content: string) => void;
  };

export type UploadTextCustomAddUpdateStore = UploadTextCustomAddUpdateState &
  UploadTextCustomAddUpdateAction;
