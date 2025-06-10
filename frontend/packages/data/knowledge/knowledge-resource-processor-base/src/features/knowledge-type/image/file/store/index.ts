import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import {
  CreateUnitStatus,
  type UploadBaseAction,
  type UploadBaseState,
  type ProgressItem,
  type UnitItem,
} from '@coze-data/knowledge-resource-processor-core';

import { ImageAnnotationType, ImageFileAddStep } from '../types';

export type ImageFileAddStore = UploadBaseState<ImageFileAddStep> &
  UploadBaseAction<ImageFileAddStep> & {
    annotationType: ImageAnnotationType;
    setAnnotationType: (annotationType: ImageAnnotationType) => void;
  };

const storeStaticValues: Pick<
  ImageFileAddStore,
  | 'unitList'
  | 'currentStep'
  | 'annotationType'
  | 'createStatus'
  | 'progressList'
> = {
  currentStep: ImageFileAddStep.Upload,
  unitList: [],
  annotationType: ImageAnnotationType.Auto,
  createStatus: CreateUnitStatus.UPLOAD_UNIT,
  progressList: [],
};

export const createImageFileAddStore = () =>
  create<ImageFileAddStore>()(
    devtools((set, get, store) => ({
      ...storeStaticValues,
      setCurrentStep: (currentStep: ImageFileAddStep) => {
        set({ currentStep });
      },
      setUnitList: (unitList: UnitItem[]) => {
        set({ unitList });
      },
      setAnnotationType: (annotationType: ImageAnnotationType) => {
        set({ annotationType });
      },
      setCreateStatus: (createStatus: CreateUnitStatus) => {
        set({ createStatus });
      },
      setProgressList: (progressList: ProgressItem[]) => {
        set({ progressList });
      },
      reset: () => {
        set(storeStaticValues);
      },
    })),
  );
