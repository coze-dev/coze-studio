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
import {
  CreateUnitStatus,
  type ProgressItem,
  type UnitItem,
} from '@coze-data/knowledge-resource-processor-core';
import {
  type OpenSearchConfig,
  StorageLocation,
} from '@coze-arch/idl/knowledge';

import { SegmentMode, type CustomSegmentRule } from '@/types';
import { defaultCustomSegmentRule } from '@/constants';

import { type UploadTextStore, type UploadTextState } from './interface';

export const getDefaultTextState: () => UploadTextState<number> = () => ({
  /** base store */
  createStatus: CreateUnitStatus.UPLOAD_UNIT,
  progressList: [],
  unitList: [],
  currentStep: 0,
  /** text store */
  segmentRule: defaultCustomSegmentRule,
  segmentMode: SegmentMode.AUTO,
  enableStorageStrategy: false,
  storageLocation: StorageLocation.Default,
  openSearchConfig: {},
  testConnectionSuccess: false,
});

export const createTextSlice: StateCreator<UploadTextStore<number>> = set => ({
  /** defaultState */
  ...getDefaultTextState(),
  /** base store action */
  setCurrentStep: (currentStep: number) => {
    set({ currentStep });
  },
  setCreateStatus: (createStatus: CreateUnitStatus) => {
    set({ createStatus });
  },
  setProgressList: (progressList: ProgressItem[]) => {
    set({ progressList });
  },
  setUnitList: (unitList: UnitItem[]) => {
    set({ unitList });
  },
  /** text store action */
  setSegmentRule: (rule: CustomSegmentRule) => set({ segmentRule: rule }),
  setSegmentMode: (mode: SegmentMode) => set({ segmentMode: mode }),
  setEnableStorageStrategy: (enableStorageStrategy: boolean) => {
    set({ enableStorageStrategy });
  },
  setStorageLocation: (storageLocation: StorageLocation) => {
    set({ storageLocation });
  },
  setOpenSearchConfig: (openSearchConfig: OpenSearchConfig) => {
    set({ openSearchConfig });
  },
  setTestConnectionSuccess: (testConnectionSuccess: boolean) => {
    set({ testConnectionSuccess });
  },
  /** reset state */
  reset: () => {
    set(getDefaultTextState());
  },
});
