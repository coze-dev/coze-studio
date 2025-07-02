import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

import { type StepState, type Step } from '../types';

export interface StepStore {
  step: Step;
  enableGoToNextStep: boolean;
  step1_upload: StepState.Upload;
  step2_tableStructure: StepState.TableStructure;
  step3_tablePreview: StepState.TablePreview;
  step4_processing: StepState.Processing;
  goToNextStep: () => void;
  backToPreviousStep: () => void;
  reset: () => void;
  set_step1_upload: (newState: StepState.Upload) => void;
  set_step2_tableStructure: (newState: StepState.TableStructure) => void;
  set_step3_tablePreview: (newState: StepState.TablePreview) => void;
  set_step4_processing: (newState: StepState.Processing) => void;
  set_enableGoToNextStep: (newState: boolean) => void;
}

export const useStepStore = create<StepStore>()(
  devtools(set => ({
    step: 1,
    enableGoToNextStep: true,
    step1_upload: {},
    step2_tableStructure: {},
    step3_tablePreview: {},
    step4_processing: {},
    set_step1_upload: (newState: StepState.Upload) =>
      set(state => ({
        step1_upload: {
          ...state.step1_upload,
          ...newState,
        },
      })),
    set_step2_tableStructure: (newState: StepState.TableStructure) =>
      set(state => ({
        step2_tableStructure: {
          ...state.step2_tableStructure,
          ...newState,
        },
      })),
    set_step3_tablePreview: (newState: StepState.TablePreview) =>
      set(state => ({
        step3_tablePreview: {
          ...state.step3_tablePreview,
          ...newState,
        },
      })),
    set_step4_processing: (newState: StepState.Processing) =>
      set(state => ({
        step4_processing: {
          ...state.step4_processing,
          ...newState,
        },
      })),
    goToNextStep: () =>
      set(state => ({
        step: state.step + 1,
      })),
    backToPreviousStep: () =>
      set(state => ({
        step: state.step - 1,
      })),
    reset: () =>
      set({
        step: 1,
        enableGoToNextStep: true,
        step1_upload: {},
        step2_tableStructure: {},
        step3_tablePreview: {},
        step4_processing: {},
      }),
    set_enableGoToNextStep: (newState: boolean) => {
      set(() => ({ enableGoToNextStep: newState }));
    },
  })),
);
