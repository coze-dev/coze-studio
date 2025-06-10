import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { merge } from 'lodash-es';
import { ParsingType } from '@coze-arch/idl/knowledge';

import {
  createTextSlice,
  getDefaultTextState,
} from '@/features/knowledge-type/text/slice';

import { TextResegmentStep } from '../constants';
import {
  type UploadTextResegmentState,
  type UploadTextResegmentStore,
} from './types';

const getDefaultTextResegmentState: () => UploadTextResegmentState = () => ({
  ...getDefaultTextState(),
  currentStep: TextResegmentStep.SEGMENT_CLEANER,
  parsingStrategy: {
    parsing_type: ParsingType.AccurateParsing,
    image_extraction: true,
    image_ocr: true,
    table_extraction: true,
  },
  filterStrategy: [],
  indexStrategy: {},
  documentInfo: null,
  levelChunkStrategy: {
    maxLevel: 3,
  },
});

export const createTextResegmentStore = () =>
  create<UploadTextResegmentStore>()(
    devtools(
      (set, get, ...arg) => ({
        ...createTextSlice(set, get, ...arg),
        // overwrite
        ...getDefaultTextResegmentState(),
        // /** reset state */
        reset: () => {
          set(getDefaultTextResegmentState());
        },
        setFilterStrategy: filterStrategy => {
          set({ filterStrategy }, false, 'setFilterStrategy');
        },
        setIndexStrategyByMerge: indexStrategy => {
          set(
            { indexStrategy: merge({}, get().indexStrategy, indexStrategy) },
            false,
            'setIndexStrategyByMerge',
          );
        },
        setParsingStrategyByMerge: parsingStrategy => {
          set(
            {
              parsingStrategy: merge(
                {},
                get().parsingStrategy,
                parsingStrategy,
              ),
            },
            false,
            'setParsingStrategyByMerge',
          );
        },
        setDocumentInfo: documentInfo =>
          set({ documentInfo }, false, 'setDocumentInfo'),
        setLevelChunkStrategy: (key, value) => {
          set(state => ({
            ...state,
            levelChunkStrategy: {
              ...state.levelChunkStrategy,
              [key]: value,
            },
          }));
        },
      }),
      {
        enabled: IS_DEV_MODE,
        name: 'Coz.Data.TextResegment',
      },
    ),
  );
