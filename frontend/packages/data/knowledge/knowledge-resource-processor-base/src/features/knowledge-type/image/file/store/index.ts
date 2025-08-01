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
