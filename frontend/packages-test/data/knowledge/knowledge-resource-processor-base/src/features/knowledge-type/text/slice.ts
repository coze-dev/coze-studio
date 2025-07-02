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
