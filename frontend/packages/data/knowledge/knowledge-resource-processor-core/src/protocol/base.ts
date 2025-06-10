import { type StoreApi, type UseBoundStore } from 'zustand';

import type { ProgressItem, UnitItem, ContentProps } from '../types';
import {
  type OptType,
  type CreateUnitStatus,
  type UnitType,
  type CheckedStatus,
} from '../constants';

export interface UploadBaseState<T extends number | string> {
  currentStep: T;
  createStatus: CreateUnitStatus;
  progressList: ProgressItem[];
  unitList: UnitItem[];
}

export interface UploadBaseAction<T extends number | string> {
  setCurrentStep: (step: T) => void;
  setCreateStatus: (createStatus: CreateUnitStatus) => void;
  setProgressList: (progressList: ProgressItem[]) => void;
  setUnitList: (unitList: UnitItem[]) => void;
  reset: () => void;
}

/** need to implement this function. */
export type GetUploadConfig<T, R> = (
  type: UnitType,
  opt: OptType,
) => UploadConfig<T, R> | null;

/** upload unified configuration */
export interface UploadConfig<T, R> {
  steps: UploadConfigSteps<T, R>;
  createStore: () => UseBoundStore<StoreApi<R>>;
  className?: string;
  /** Whether to show the top step, default true */
  showStep?: boolean;
  useUploadMount?: (
    store: UseBoundStore<StoreApi<R>>,
  ) => [React.ReactElement | undefined, CheckedStatus | undefined] | null;
}

export type UploadConfigSteps<T, R> = Array<UploadConfigStep<T, R>>;

export interface UploadConfigStep<T, R> {
  content?: (props: ContentProps<R>) => React.ReactElement;
  showThisStep?: (checkStatus?: CheckedStatus) => boolean;
  title: string;
  step: T;
  e2e?: string;
}
