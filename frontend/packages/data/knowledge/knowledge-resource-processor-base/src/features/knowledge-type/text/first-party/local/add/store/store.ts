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
      image_ocr: false,
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
