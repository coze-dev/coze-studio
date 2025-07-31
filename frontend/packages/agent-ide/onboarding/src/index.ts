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

export {
  OnboardingMarkdownModal,
  type OnboardingMarkdownModalProps,
} from './components/onboarding-markdown-modal';

export {
  getImmerUpdateOnboardingSuggestion,
  getOnboardingSuggestionAfterDeleteById,
  immerUpdateOnboardingStoreSuggestion,
  updateOnboardingStorePrologue,
  deleteOnboardingStoreSuggestion,
  getShuffledSuggestions,
} from './utils/onboarding';

export {
  OnboardingVariable,
  type OnboardingVariableMap,
} from './constant/onboarding-variable';

export { useRenderVariable } from './hooks/onboarding/use-render-variable-element';

export { ONBOARDING_PREVIEW_DELAY } from './components/onboarding-markdown-modal/constant';

export {
  useBatchLoadDraftBotPlugins,
  useDraftBotPluginById,
} from './hooks/bot-plugins';
