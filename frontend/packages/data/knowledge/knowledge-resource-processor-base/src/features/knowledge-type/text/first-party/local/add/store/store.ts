import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { merge } from 'lodash-es';
import {
  createLevelSegmentsSlice,
  createStorageStrategySlice,
  getDefaultLevelSegmentsState,
} from '@coze-data/knowledge-stores';
import { ParsingType } from '@coze-arch/idl/knowledge';

import {
  createTextSlice,
  getDefaultTextState,
} from '@/features/knowledge-type/text/slice';

import { TextLocalAddUpdateStep } from '../constants';
import {
  type UploadTextLocalAddUpdateState,
  type UploadTextLocalAddUpdateStore,
} from './types';
import {
  createDocReviewSlice,
  getDefaultDocReviewState,
} from './doc-review-slice';

const getDefaultTextLocalAddUpdateState: () => UploadTextLocalAddUpdateState =
  () => ({
    ...getDefaultTextState(),
    ...getDefaultDocReviewState(),
    ...getDefaultLevelSegmentsState(),
    currentStep: TextLocalAddUpdateStep.UPLOAD_FILE,
    parsingStrategy: {
      parsing_type: ParsingType.AccurateParsing,
      image_extraction: true,
      table_extraction: true,
      image_ocr: true,
    },
    indexStrategy: {},
    filterStrategy: [],
    levelChunkStrategy: {
      maxLevel: 3,
      isSaveTitle: true,
    },
  });

export const createTextLocalAddUpdateStore = () =>
  create<UploadTextLocalAddUpdateStore>()(
    devtools(
      (set, get, ...args) => ({
        ...createTextSlice(set, get, ...args),
        ...createDocReviewSlice(set, get, ...args),
        ...createLevelSegmentsSlice(set, get, ...args),
        ...createStorageStrategySlice(set, get, ...args),
        // overwrite
        ...getDefaultTextLocalAddUpdateState(),
        // /** reset state */
        reset: () => {
          set(getDefaultTextLocalAddUpdateState());
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
        name: 'Coz.Data.TextLocalAddUpdate',
      },
    ),
  );
