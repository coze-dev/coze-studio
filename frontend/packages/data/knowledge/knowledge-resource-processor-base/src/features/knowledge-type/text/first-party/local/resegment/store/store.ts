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
import { merge } from 'lodash-es';
import {
  createLevelSegmentsSlice,
  getDefaultLevelSegmentsState,
} from '@coze-data/knowledge-stores';
import { ParsingType, type DocumentInfo } from '@coze-arch/idl/knowledge';

import {
  createTextSlice,
  getDefaultTextState,
} from '@/features/knowledge-type/text/slice';

import { TextLocalResegmentStep } from '../constants';
import {
  type UploadTextLocalResegmentState,
  type UploadTextLocalResegmentStore,
} from './types';
import {
  createDocReviewSlice,
  getDefaultDocReviewState,
} from './doc-review-slice';

const getDefaultTextLocalResegmentState: () => UploadTextLocalResegmentState =
  () => ({
    ...getDefaultTextState(),
    ...getDefaultDocReviewState(),
    ...getDefaultLevelSegmentsState(),
    currentStep: TextLocalResegmentStep.SEGMENT_CLEANER,
    parsingStrategy: {
      parsing_type: ParsingType.AccurateParsing,
      image_extraction: true,
      table_extraction: true,
      image_ocr: false,
    },
    indexStrategy: {},
    filterStrategy: [],
    levelChunkStrategy: {
      maxLevel: 3,
      isSaveTitle: true,
    },
    documentInfo: null,
  });

export const createTextLocalResegmentStore = () =>
  create<UploadTextLocalResegmentStore>()(
    devtools(
      (set, get, ...args) => ({
        ...createTextSlice(set, get, ...args),
        ...createDocReviewSlice(set, get, ...args),
        ...createLevelSegmentsSlice(set, get, ...args),
        // overwrite
        ...getDefaultTextLocalResegmentState(),
        // /** reset state */
        reset: () => {
          set(getDefaultTextLocalResegmentState());
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
        setDocumentInfo: (doc: DocumentInfo) => {
          set({ documentInfo: doc });
        },
      }),
      {
        enabled: IS_DEV_MODE,
        name: 'Coz.Data.TextLocalResegment',
      },
    ),
  );
