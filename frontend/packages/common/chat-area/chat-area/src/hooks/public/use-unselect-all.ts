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
import { getSelectOnboardingImplement } from './use-select-onboarding';

export const useUnselectAll = () => {
  const deps = useMethodCommonDeps();
  return getUnselectAllImplement(deps);
};

export const getUnselectAllImplement = (deps: MethodCommonDeps) => () => {
  const { storeSet } = deps;
  const { useSelectionStore } = storeSet;

  const { clearSelectedReplyIdList } = useSelectionStore.getState();
  const selectOnboarding = getSelectOnboardingImplement(deps);
  clearSelectedReplyIdList();

  selectOnboarding({
    selectedId: null,
    onboarding: {},
  });
};
