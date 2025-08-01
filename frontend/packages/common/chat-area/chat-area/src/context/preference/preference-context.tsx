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

import { createContext, type PropsWithChildren, useContext } from 'react';

import { isUndefined, merge, omitBy } from 'lodash-es';
import { type MakeValueUndefinable } from '@coze-common/chat-area-utils';
import { SuggestedQuestionsShowMode } from '@coze-arch/bot-api/developer_api';
import { Layout } from '@coze-common/chat-uikit-shared';

import {
  type PreferenceContextInterface,
  type ProviderPassThroughPreference,
} from './types';

const getDefaultProviderPassThroughPreference =
  (): ProviderPassThroughPreference => ({
    enableMarkRead: false,
    enableTwoWayLoad: false,
    showUserExtendedInfo: false,
    enableImageAutoSize: false,
    imageAutoSizeContainerWidth: undefined,
    enablePasteUpload: false,
    isInputReadonly: false,
    enableDragUpload: true,
    enableSelectOnboarding: true,
    uikitChatInputButtonStatus: {},
    onboardingSuggestionsShowMode: SuggestedQuestionsShowMode.Random,
    showBackground: false,
    stopRespondOverrideWaiting: undefined,
  });

const getDefaultPreference = (): Required<PreferenceContextInterface> => ({
  newMessageInterruptScenario: 'replying',
  enableMessageBoxActionBar: false,
  selectable: false,
  showClearContextDivider: true,
  messageWidth: '100%',
  readonly: false,
  uiKitChatInputButtonConfig: {
    isSendButtonVisible: true,
    isClearHistoryButtonVisible: true,
    isMoreButtonVisible: true,
  },
  uikitChatInputButtonStatus: {
    isClearContextButtonDisabled: false,
  },
  enableMention: false,
  theme: 'debug',
  enableLegacyUpload: false,
  enableMultimodalUpload: true,
  fileLimit: 1,
  showInputArea: true,
  showOnboardingMessage: true,
  forceShowOnboardingMessage: false,
  showStopRespond: true,
  layout: Layout.PC,
  isOnboardingCentered: false,
  stopRespondOverrideWaiting: undefined,
});

export const ProviderPassThroughContext = createContext<
  MakeValueUndefinable<ProviderPassThroughPreference>
>(getDefaultProviderPassThroughPreference());

export const useProviderPassThoughContext = () =>
  useContext(ProviderPassThroughContext);

export type MixedPreferences = PreferenceContextInterface &
  ProviderPassThroughPreference;

export const PreferenceContext = createContext<MixedPreferences>({
  ...getDefaultPreference(),
  ...getDefaultProviderPassThroughPreference(),
});

export const PreferenceProvider = ({
  children,
  value,
}: PropsWithChildren<{ value: MakeValueUndefinable<MixedPreferences> }>) => {
  const preferencesValues: MixedPreferences = merge(
    getDefaultPreference(),
    getDefaultProviderPassThroughPreference(),
    omitBy(value, isUndefined),
  );
  return (
    <PreferenceContext.Provider value={preferencesValues}>
      {children}
    </PreferenceContext.Provider>
  );
};
