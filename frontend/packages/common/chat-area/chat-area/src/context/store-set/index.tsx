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

import { createContext } from 'react';

import { type StoreSet } from '../chat-area-context/type';
import { type NullableType } from '../../typing/util-types';

type NullableStoreSetContextType = NullableType<StoreSet>;

export const StoreSetContext = createContext<NullableStoreSetContextType>({
  useBatchFileUploadStore: null,
  useChatActionStore: null,
  useFileStore: null,
  useGlobalInitStore: null,
  useMessageIndexStore: null,
  useMessageMetaStore: null,
  useMessagesStore: null,
  useOnboardingStore: null,
  usePluginStore: null,
  useSectionIdStore: null,
  useSelectionStore: null,
  useSenderInfoStore: null,
  useSuggestionsStore: null,
  useWaitingStore: null,
  useAudioUIStore: null,
});
