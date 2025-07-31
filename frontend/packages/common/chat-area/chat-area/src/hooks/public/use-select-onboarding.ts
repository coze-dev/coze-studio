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

import { useMethodCommonDeps } from '../context/use-method-common-deps';
import { type MethodCommonDeps } from '../../plugin/types';
import { type OnboardingSelectChangeParams } from '../../context/chat-area-context/chat-area-callback';

export const useSelectOnboarding = () => {
  const deps = useMethodCommonDeps();

  return getSelectOnboardingImplement(deps);
};

export const getSelectOnboardingImplement =
  (deps: MethodCommonDeps) => async (params: OnboardingSelectChangeParams) => {
    const { context, storeSet } = deps;
    const { eventCallback, lifeCycleService } = context;
    const { useSelectionStore } = storeSet;
    const { setOnboardingSelected, selectedOnboardingId } =
      useSelectionStore.getState();
    const hasSelectedOnboarding = Boolean(selectedOnboardingId);
    setOnboardingSelected(params.selectedId);
    eventCallback?.onOnboardingSelectChange?.(params, hasSelectedOnboarding);
    await lifeCycleService.command.onOnboardingSelectChange({
      ctx: {
        selected: params,
        isAlreadyHasSelect: hasSelectedOnboarding,
        content: params.onboarding.prologue ?? '',
      },
    });
  };
